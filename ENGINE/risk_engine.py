# =========================
# ⚠️ RISK ENGINE (Adapter Ready)
# =========================

def analyze_risk(state):
    entropy = float(state.get("entropy", 0))
    resource = float(state.get("resource", 100))
    stability = float(state.get("stability", 50))
    drift = float(state.get("drift", 0))
    choices = int(state.get("choices", 1) or 1)

    # 🔥 CORE RISK FORMULA
    risk_score = (
        entropy * 0.45
        + (100 - resource) * 0.35
        + (100 - stability) * 0.20
        + drift * 0.10
    )

    risk_score = round(max(0, min(100, risk_score)), 2)

    # 🔥 LEVEL
    if resource <= 5 or stability <= 5:
        level = "CRITICAL"
    elif risk_score >= 85:
        level = "CRITICAL"
    elif risk_score >= 60:
        level = "HIGH"
    elif risk_score >= 30:
        level = "MEDIUM"
    else:
        level = "LOW"

    decision_level = _map_to_decision(level)

    return {
        "risk_score": risk_score,
        "level": level,
        "decision_level": decision_level,
        "remaining_choices": max(1, choices),
        "stability": stability,
        "resource": resource,
        "entropy": entropy,
        "drift": drift,
    }


def _map_to_decision(level):
    if level in ["CRITICAL", "HIGH"]:
        return "HIGH"
    if level == "MEDIUM":
        return "MEDIUM"
    return "LOW"


# =========================
# 🔥 ADAPTER (สำคัญ)
# =========================
# ให้ DecisionEngine เรียกได้

def assess(pattern: dict):
    try:
        return analyze_risk(pattern)
    except Exception as e:
        return {"error": f"risk_engine fail: {str(e)}"}
