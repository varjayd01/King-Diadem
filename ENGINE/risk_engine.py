# ENGINE/risk_engine.py
# KING DIADEM — Risk Engine
# Public API: assess(pattern) ← DecisionEngine + app.py


def _safe_float(val, default=0.0) -> float:
    try:
        return float(val)
    except (TypeError, ValueError):
        return default


def analyze_risk(state: dict) -> dict:
    """
    สูตร risk = entropy*0.45 + (100-resource)*0.35 + (100-stability)*0.20 + drift*0.10
    """
    entropy   = _safe_float(state.get("entropy",   40))
    resource  = _safe_float(state.get("resource",  50))
    stability = _safe_float(state.get("stability", 50))
    drift     = _safe_float(state.get("drift",      0))
    choices   = max(1, int(state.get("choices", 1) or 1))

    risk_score = (
        entropy   * 0.45
        + (100 - resource)  * 0.35
        + (100 - stability) * 0.20
        + drift             * 0.10
    )
    risk_score = round(max(0.0, min(100.0, risk_score)), 2)

    # ── Level ──────────────────────────────────────────────────
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

    return {
        "risk_score":        risk_score,
        "level":             level,
        "decision_level":    "HIGH" if level in ("CRITICAL", "HIGH") else
                             "MEDIUM" if level == "MEDIUM" else "LOW",
        "remaining_choices": max(1, choices),
        "stability":         stability,
        "resource":          resource,
        "entropy":           entropy,
        "drift":             drift,
    }


# ── Public adapter ─────────────────────────────────────────────────
def assess(pattern: dict) -> dict:
    """app.py และ DecisionEngine เรียกตัวนี้"""
    try:
        return analyze_risk(pattern)
    except Exception as e:
        return {"error": f"risk_engine fail: {e}"}
