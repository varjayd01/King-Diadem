# ENGINE/collapse_predictor.py
# KING DIADEM — Collapse Predictor


def _clamp(x, low=0, high=100) -> float:
    try:
        x = float(x)
    except (TypeError, ValueError):
        x = 0.0
    return max(low, min(high, x))


def predict_collapse(risk_score: float) -> dict:
    """
    รับ risk_score 0-100
    คืน: { risk_score, collapse_level, probability, prediction }
    """
    risk_score = _clamp(risk_score)

    if risk_score >= 85:
        level, probability = "CRITICAL", 0.9
    elif risk_score >= 65:
        level, probability = "HIGH", 0.7
    elif risk_score >= 40:
        level, probability = "MEDIUM", 0.4
    else:
        level, probability = "LOW", 0.1

    return {
        "risk_score":     risk_score,
        "collapse_level": level,
        "probability":    probability,
        "prediction":     _label(level),
    }


def _label(level: str) -> str:
    return {
        "CRITICAL": "Collapse imminent",
        "HIGH":     "High collapse probability",
        "MEDIUM":   "Moderate instability",
        "LOW":      "System stable",
    }.get(level, "Unknown")


# ── Adapter สำหรับ DecisionEngine ─────────────────────────────────
def analyze(pattern: dict) -> dict:
    """DecisionEngine เรียก analyze(pattern)"""
    try:
        risk = float(pattern.get("risk_score", pattern.get("entropy", 40)))
        return predict_collapse(risk)
    except Exception as e:
        return {"error": f"collapse_predictor fail: {e}"}
