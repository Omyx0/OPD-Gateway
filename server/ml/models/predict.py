import sys
import joblib
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]

if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

from safety.rules import apply_safety_rules

MODEL_FILE = BASE_DIR / "models" / "triage_vitals_model.joblib"

model = joblib.load(MODEL_FILE)

print("\n===== OPD Triage Prediction =====\n")

# Take patient input
chief_complaint = input("Enter chief complaint/symptoms: ")

temperature = float(input("Temperature (°C): "))
heartrate = float(input("Heart rate: "))
resprate = float(input("Respiratory rate: "))
o2sat = float(input("O2 saturation (%): "))
sbp = float(input("Systolic BP: "))
dbp = float(input("Diastolic BP: "))
pain = float(input("Pain score (0-10): "))

# Create input dataframe
patient = pd.DataFrame([{
    "chiefcomplaint": chief_complaint,
    "temperature": temperature,
    "heartrate": heartrate,
    "resprate": resprate,
    "o2sat": o2sat,
    "sbp": sbp,
    "dbp": dbp,
    "pain": pain,
}])
# Prediction
prediction = model.predict(patient)[0]

# Prediction probabilities
probabilities = model.predict_proba(patient)[0]
classes = model.classes_

confidence = probabilities.max() * 100

# Apply safety rules
result = apply_safety_rules(
    ml_priority=prediction,
    temperature=temperature,
    heartrate=heartrate,
    resprate=resprate,
    o2sat=o2sat,
    sbp=sbp,
    dbp=dbp,
    pain=pain,
    chief_complaint=chief_complaint
)

print("\n===== Prediction Result =====")

print(f"ML Priority: {result['ml_priority']}")
print(f"Final Priority: {result['final_priority']}")
print(f"Confidence: {confidence:.2f}%")

if result["safety_override"]:
    print("\n⚠️ Safety Rule Override: YES")
    print("Reasons:")
    for reason in result["reasons"]:
        print(f"- {reason}")
else:
    print("\nSafety Rule Override: NO")

print("\nClass probabilities:")
for class_name, probability in zip(classes, probabilities):
    print(f"{class_name}: {probability * 100:.2f}%")