def analyze_risk(state):
    risk = state["entropy"] * 0.5 + (100 - state["resource"]) * 0.5

    return {
        "risk_score": risk,
        "level": "HIGH" if risk > 60 else "NORMAL"
    }
