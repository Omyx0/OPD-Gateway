"""
FastAPI ML Triage Service

Exposes the trained scikit-learn triage model via HTTP.
Started alongside the Express server by `npm run dev`.
"""

import sys
from pathlib import Path
from contextlib import asynccontextmanager

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Add parent dirs to path so safety module can be imported
ML_ROOT = Path(__file__).resolve().parents[1]
if str(ML_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_ROOT))

from safety.rules import apply_safety_rules
from api.schemas import TriageInput, TriageOutput, HealthResponse

# ── Model loading ────────────────────────────────────────────────────

MODEL_PATH = ML_ROOT / "models" / "triage_vitals_model.joblib"
_model = None


def load_model():
    """Load the trained model from disk."""
    global _model
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
    _model = joblib.load(MODEL_PATH)
    print(f"✅ ML model loaded from {MODEL_PATH}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup, cleanup on shutdown."""
    try:
        load_model()
    except Exception as e:
        print(f"⚠️ Failed to load ML model: {e}")
        print("   The /predict endpoint will return errors until model is available.")
    yield


# ── App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="Smart OPD ML Triage Service",
    description="Provides ML-based preliminary triage predictions for OPD patients.",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Endpoints ────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check — reports whether model is loaded."""
    return HealthResponse(
        status="ok",
        model_loaded=_model is not None,
        model_name="triage_vitals_logistic_regression",
    )


@app.post("/predict", response_model=TriageOutput)
async def predict(data: TriageInput):
    """
    Run triage prediction.

    Takes patient vitals + chief complaint, runs through:
    1. ML model (scikit-learn LogisticRegression)
    2. Deterministic safety rules
    3. Returns combined result with safety override if needed
    """
    if _model is None:
        raise HTTPException(
            status_code=503,
            detail="ML model not loaded. Check server logs.",
        )

    try:
        # Build input DataFrame matching training format
        input_data = pd.DataFrame([{
            "chiefcomplaint": data.chief_complaint.lower().strip(),
            "temperature": data.temperature,
            "heartrate": data.heartrate,
            "resprate": data.resprate,
            "o2sat": data.o2sat,
            "sbp": data.sbp,
            "dbp": data.dbp,
            "pain": data.pain,
        }])

        # ML prediction
        ml_priority = _model.predict(input_data)[0]
        probabilities = _model.predict_proba(input_data)[0]
        classes = _model.classes_

        class_probs = {
            str(cls): round(float(prob), 4)
            for cls, prob in zip(classes, probabilities)
        }
        confidence = float(probabilities.max())

        # Apply safety rules
        safety_result = apply_safety_rules(
            ml_priority=ml_priority,
            temperature=data.temperature or 98.6,
            heartrate=data.heartrate or 80,
            resprate=data.resprate or 16,
            o2sat=data.o2sat or 98,
            sbp=data.sbp or 120,
            dbp=data.dbp or 80,
            pain=data.pain or 0,
            chief_complaint=data.chief_complaint,
        )

        return TriageOutput(
            ml_priority=str(ml_priority),
            final_priority=safety_result["final_priority"],
            confidence=round(confidence, 4),
            safety_override=safety_result["safety_override"],
            reasons=safety_result["reasons"],
            class_probabilities=class_probs,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}",
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
