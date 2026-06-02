# ENGINE/risk_engine.py — KING DIADEM
# Public API: assess(pattern) ← app.py + orchestrator

def _safe(val, default=0.0):
    try: return float(val)
    except: return default

def analyze_risk(state: dict) -> dict:
    entropy   = _safe(state.get("entropy",   40))
    resource  = _safe(state.get("resource",  50))
    stability = _safe(state.get("stability", 50))
    drift     = _safe(state.get("drift",      0))
    choices   = max(1, int(state.get("choices", 1) or 1))
    score = round(max(0, min(100,
        entropy*0.45 + (100-resource)*0.35 + (100-stability)*0.20 + drift*0.10)), 2)
    if resource <= 5 or stability <= 5: level = "CRITICAL"
    elif score >= 85: level = "CRITICAL"
    elif score >= 60: level = "HIGH"
    elif score >= 30: level = "MEDIUM"
    else:             level = "LOW"
    return {"risk_score": score, "level": level,
            "decision_level": "HIGH" if level in ("CRITICAL","HIGH") else "MEDIUM" if level=="MEDIUM" else "LOW",
            "remaining_choices": choices, "stability": stability, "resource": resource,
            "entropy": entropy, "drift": drift}

def assess(pattern: dict) -> dict:
    try: return analyze_risk(pattern)
    except Exception as e: return {"error": f"risk_engine fail: {e}"}
