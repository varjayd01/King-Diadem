# ENGINE/risk_engine.py

def analyze_risk(state):
    entropy = float(state.get("entropy", 0))
    resource = float(state.get("resource", 100))
    stability = float(state.get("stability", 50))
    drift = float(state.get("drift", 0))

    risk_score = (
        entropy * 0.45
        + (100 - resource) * 0.35
        + (100 - stability) * 0.20
        + drift * 0.10
    )

    risk_score = round(max(0, min(100, risk_score)), 2)

    if risk_score >= 85:
        level = "CRITICAL"
    elif risk_score >= 60:
        level = "HIGH"
    elif risk_score >= 30:
        level = "NORMAL"
    else:
        level = "LOW"

    return {
        "risk_score": risk_score,
        "level": level,
        "remaining_choices": max(1, int(state.get("choices", 1) or 1)),
        "stability": stability,
        "resource": resource,
        "entropy": entropy,
        "drift": drift,
    }
