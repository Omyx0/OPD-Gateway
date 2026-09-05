def apply_safety_rules(
    ml_priority,
    temperature,
    heartrate,
    resprate,
    o2sat,
    sbp,
    dbp,
    pain,
    chief_complaint
):
    """
    Demo safety rules.
    These rules can override the ML prediction
    when dangerous symptoms or vital signs are detected.
    """

    reasons = []

    complaint = str(chief_complaint).lower()

    # Vital sign safety checks
    if o2sat < 90:
        reasons.append("O2 saturation below 90%")

    if resprate >= 30:
        reasons.append("Very high respiratory rate")

    if sbp < 90:
        reasons.append("Low systolic blood pressure")

    if pain >= 9:
        reasons.append("Severe pain")

    # Emergency symptom checks
    emergency_terms = [
        "difficulty in breathing",
        "breathing difficulty",
        "shortness of breath",
        "severe chest pain",
        "unconscious",
        "fainting",
        "seizure",
        "stroke",
        "head bleed",
    ]

    for term in emergency_terms:
        if term in complaint:
            reasons.append(f"Emergency symptom: {term}")
            break

    # Override ML prediction if safety condition is detected
    if reasons:
        final_priority = "RED"
        safety_override = True
    else:
        final_priority = ml_priority
        safety_override = False

    return {
        "ml_priority": ml_priority,
        "final_priority": final_priority,
        "safety_override": safety_override,
        "reasons": reasons,
    }