# ENGINE/simulation_engine.py
# KING DIADEM — Simulation Engine
# Public API: simulate() ← app.py เรียก
# Core:       simulate_future() + run_simulation()

from typing import Any


# ══════════════════════════════════════════════════════════════════
# PUBLIC API — app.py ใช้ตัวนี้
# ══════════════════════════════════════════════════════════════════
def simulate(text: str, paths: list = None) -> dict:
    """
    รับ: text (สถานการณ์), paths (ทางเลือกที่ผู้ใช้ระบุ)
    คืน: { scenarios, best_path, risk_summary }

    ใช้ rule-based เพื่อเป็น context ให้ LLM ต่อยอด
    ไม่ hardcode คำตอบ — แค่ให้ frame ที่ถูก
    """
    paths = paths or []

    # วิเคราะห์ text หาสัญญาณ
    signals = _scan_signals(text)

    # สร้าง scenarios พื้นฐาน 3 ทาง
    scenarios = _build_scenarios(signals, paths)

    # best path = scenario ที่ risk ต่ำสุด
    best = min(scenarios, key=lambda s: s["risk"])

    return {
        "scenarios":    scenarios,
        "best_path":    best,
        "risk_summary": _risk_summary(signals),
        "signals":      signals,
        "horizon_days": [30, 90, 365],
    }


# ══════════════════════════════════════════════════════════════════
# CORE — simulate_future (legacy, ยังใช้ได้)
# ══════════════════════════════════════════════════════════════════
def simulate_future(state: Any) -> list:
    """
    Rule-based scenario tree
    คืน list of scenarios สำหรับ LLM ใช้เป็น context
    """
    if isinstance(state, str):
        signals = _scan_signals(state)
    elif isinstance(state, dict):
        signals = state
    else:
        signals = {}

    return _build_scenarios(signals, [])


def run_simulation(state: Any) -> list:
    """alias ของ simulate_future"""
    return simulate_future(state)


# ══════════════════════════════════════════════════════════════════
# INTERNAL
# ══════════════════════════════════════════════════════════════════
def _scan_signals(text: str) -> dict:
    """อ่าน text หา pattern ความเสี่ยง"""
    t = str(text).lower()
    return {
        "has_financial_risk": any(w in t for w in ["เงิน", "หนี้", "ขาดทุน", "money", "debt", "loss"]),
        "has_survival_risk":  any(w in t for w in ["หิว", "ไม่มีที่", "อันตราย", "food", "shelter", "danger"]),
        "has_collapse_risk":  any(w in t for w in ["พัง", "ล้ม", "collapse", "crisis", "วิกฤต"]),
        "has_opportunity":    any(w in t for w in ["โอกาส", "เติบโต", "opportunity", "grow", "expand"]),
        "has_uncertainty":    any(w in t for w in ["ไม่แน่", "uncertain", "maybe", "บางที", "คงจะ"]),
    }


def _build_scenarios(signals: dict, user_paths: list) -> list:
    """สร้าง scenarios 3 ระดับ: stable / resource_drop / high_risk"""
    scenarios = []

    # Scenario 1: ดำเนินต่อ (baseline)
    base_risk = 2
    if signals.get("has_financial_risk"): base_risk += 2
    if signals.get("has_uncertainty"):    base_risk += 1
    scenarios.append({
        "label":  "ดำเนินต่อ (baseline)",
        "future": "stable",
        "risk":   min(10, base_risk),
        "action": "maintain",
        "horizon": {
            "30d":  "ไม่มีการเปลี่ยนแปลงมาก",
            "90d":  "drift สะสมถ้าไม่แก้ปัญหาต้นทาง",
            "365d": "ผลสะสมชัดขึ้น — ดีหรือแย่ขึ้นอยู่กับวันนี้",
        },
    })

    # Scenario 2: ทรัพยากรลด
    drop_risk = 5
    if signals.get("has_financial_risk"): drop_risk += 2
    if signals.get("has_survival_risk"):  drop_risk += 2
    scenarios.append({
        "label":  "ทรัพยากรลด",
        "future": "resource_drop",
        "risk":   min(10, drop_risk),
        "action": "secure_resources",
        "horizon": {
            "30d":  "ต้องการ buffer ทันที",
            "90d":  "ถ้าไม่ secure ทรัพยากร cascade เริ่ม",
            "365d": "ผลกระทบต่อทุกมิติชีวิต",
        },
    })

    # Scenario 3: ความเสี่ยงสูง
    high_risk = 7
    if signals.get("has_collapse_risk"):  high_risk += 2
    if signals.get("has_survival_risk"):  high_risk += 1
    scenarios.append({
        "label":  "ความเสี่ยงสูง",
        "future": "high_risk",
        "risk":   min(10, high_risk),
        "action": "escape" if high_risk >= 8 else "stabilize",
        "horizon": {
            "30d":  "ต้องการ intervention ทันที",
            "90d":  "ถ้าไม่ act ช่อง escape แคบลง",
            "365d": "recovery ยากขึ้น 3x",
        },
    })

    # เพิ่ม user paths ถ้ามี
    for i, path in enumerate(user_paths[:3]):
        if str(path).strip():
            scenarios.append({
                "label":  f"ทางเลือกผู้ใช้ {i+1}: {str(path)[:60]}",
                "future": "user_defined",
                "risk":   5,
                "action": "evaluate",
                "horizon": {
                    "30d":  "ขึ้นอยู่กับการ execute",
                    "90d":  "ผลจะชัดขึ้น",
                    "365d": "ดูที่ consistency ของการกระทำ",
                },
            })

    return scenarios


def _risk_summary(signals: dict) -> str:
    active = [k.replace("has_", "").replace("_", " ") for k, v in signals.items() if v]
    if not active:
        return "ไม่พบสัญญาณเสี่ยงชัดเจน — ดำเนินต่อได้ระมัดระวัง"
    return f"สัญญาณที่ตรวจพบ: {', '.join(active)}"
