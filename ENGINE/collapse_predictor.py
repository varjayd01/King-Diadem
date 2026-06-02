# ENGINE/collapse_predictor.py — KING DIADEM

def _clamp(x, low=0, high=100):
    try: return max(low, min(high, float(x)))
    except: return float(low)

def predict_collapse(risk_score: float) -> dict:
    risk_score = _clamp(risk_score)
    if risk_score >= 85:   level, prob = "CRITICAL", 0.9
    elif risk_score >= 65: level, prob = "HIGH",     0.7
    elif risk_score >= 40: level, prob = "MEDIUM",   0.4
    else:                  level, prob = "LOW",      0.1
    return {"risk_score": risk_score, "collapse_level": level, "probability": prob,
            "prediction": {"CRITICAL":"Collapse imminent","HIGH":"High collapse probability",
                           "MEDIUM":"Moderate instability","LOW":"System stable"}.get(level,"Unknown")}

def analyze(pattern: dict) -> dict:
    try:
        risk = float(pattern.get("risk_score", pattern.get("entropy", 40)))
        return predict_collapse(risk)
    except Exception as e:
        return {"error": f"collapse_predictor fail: {e}"}
