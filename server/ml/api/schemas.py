"""Pydantic schemas for ML triage API request/response."""

from pydantic import BaseModel, Field
from typing import Optional


class TriageInput(BaseModel):
    """Input for the triage prediction endpoint."""
    chief_complaint: str = Field(..., min_length=1, description="Patient's chief complaint / symptoms text")
    temperature: Optional[float] = Field(None, description="Body temperature in °F")
    heartrate: Optional[float] = Field(None, description="Heart rate (bpm)")
    resprate: Optional[float] = Field(None, description="Respiratory rate (breaths/min)")
    o2sat: Optional[float] = Field(None, description="Oxygen saturation (%)")
    sbp: Optional[float] = Field(None, description="Systolic blood pressure (mmHg)")
    dbp: Optional[float] = Field(None, description="Diastolic blood pressure (mmHg)")
    pain: Optional[float] = Field(None, ge=0, le=10, description="Pain score (0-10)")


class SafetyFlag(BaseModel):
    """A single safety rule that was triggered."""
    reason: str


class TriageOutput(BaseModel):
    """Output from the triage prediction endpoint."""
    ml_priority: str = Field(..., description="Priority from ML model (RED/YELLOW/GREEN)")
    final_priority: str = Field(..., description="Final priority after safety rules")
    confidence: float = Field(..., ge=0, le=1, description="Model confidence (0-1)")
    safety_override: bool = Field(..., description="Whether safety rules overrode the ML prediction")
    reasons: list[str] = Field(default_factory=list, description="Safety rule reasons if override occurred")
    class_probabilities: dict[str, float] = Field(default_factory=dict, description="Per-class probabilities")
    model_name: str = Field(default="triage_vitals_logistic_regression")
    model_version: str = Field(default="v2")


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "ok"
    model_loaded: bool
    model_name: str
