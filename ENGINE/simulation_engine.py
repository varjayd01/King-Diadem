# ENGINE/simulation_engine.py — KING DIADEM
# Public API: simulate() ← app.py | Core: simulate_future()

def simulate(text: str, paths: list = None) -> dict:
    paths   = paths or []
    signals = _scan(text)
    scenarios = _build(signals, paths)
    best = min(scenarios, key=lambda s: s["risk"])
    return {"scenarios": scenarios, "best_path": best,
            "risk_summary": _summary(signals), "signals": signals, "horizon_days": [30, 90, 365]}

def simulate_future(state) -> list:
    signals = _scan(state) if isinstance(state, str) else (state if isinstance(state, dict) else {})
    return _build(signals, [])

def run_simulation(state) -> list:
    return simulate_future(state)

def _scan(text: str) -> dict:
    t = str(text).lower()
    return {
        "has_financial_risk": any(w in t for w in ["เงิน","หนี้","ขาดทุน","money","debt","loss"]),
        "has_survival_risk":  any(w in t for w in ["หิว","ไม่มีที่","อันตราย","food","shelter","danger"]),
        "has_collapse_risk":  any(w in t for w in ["พัง","ล้ม","collapse","crisis","วิกฤต"]),
        "has_opportunity":    any(w in t for w in ["โอกาส","เติบโต","opportunity","grow"]),
        "has_uncertainty":    any(w in t for w in ["ไม่แน่","uncertain","maybe","บางที"]),
    }

def _build(signals: dict, user_paths: list) -> list:
    scenarios = [
        {"label": "ดำเนินต่อ (baseline)", "future": "stable",
         "risk": min(10, 2 + (2 if signals.get("has_financial_risk") else 0) + (1 if signals.get("has_uncertainty") else 0)),
         "action": "maintain",
         "horizon": {"30d": "ไม่มีการเปลี่ยนแปลงมาก", "90d": "drift สะสมถ้าไม่แก้ต้นทาง", "365d": "ผลสะสมชัดขึ้น"}},
        {"label": "ทรัพยากรลด", "future": "resource_drop",
         "risk": min(10, 5 + (2 if signals.get("has_financial_risk") else 0) + (2 if signals.get("has_survival_risk") else 0)),
         "action": "secure_resources",
         "horizon": {"30d": "ต้องการ buffer ทันที", "90d": "ถ้าไม่ secure cascade เริ่ม", "365d": "ผลกระทบทุกมิติ"}},
        {"label": "ความเสี่ยงสูง", "future": "high_risk",
         "risk": min(10, 7 + (2 if signals.get("has_collapse_risk") else 0) + (1 if signals.get("has_survival_risk") else 0)),
         "action": "stabilize",
         "horizon": {"30d": "ต้องการ intervention ทันที", "90d": "ช่อง escape แคบลง", "365d": "recovery ยาก 3x"}},
    ]
    for i, path in enumerate(user_paths[:3]):
        if str(path).strip():
            scenarios.append({"label": f"ทางเลือก {i+1}: {str(path)[:60]}", "future": "user_defined",
                               "risk": 5, "action": "evaluate",
                               "horizon": {"30d": "ขึ้นกับ execute", "90d": "ผลชัดขึ้น", "365d": "ดูที่ consistency"}})
    return scenarios

def _summary(signals: dict) -> str:
    active = [k.replace("has_","").replace("_"," ") for k, v in signals.items() if v]
    return f"สัญญาณที่ตรวจพบ: {', '.join(active)}" if active else "ไม่พบสัญญาณเสี่ยงชัดเจน"
