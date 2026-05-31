# ENGINE/consensus_engine.py
# KING DIADEM — Consensus Engine
# Public API: build_consensus() ← app.py เรียก
# Core:       consensus_engine() + resolve()

from ENGINE.council_engine import council_engine
from ENGINE.decision_engine import decision_intelligence  # noqa: circular-safe


# ══════════════════════════════════════════════════════════════════
# PUBLIC API — app.py ใช้ตัวนี้
# ══════════════════════════════════════════════════════════════════
def build_consensus(payload: dict) -> dict:
    """
    รับ: { text, response, route, human_state }
    คืน: { consensus, confidence, action, voters }

    ทำงาน:
    1. decision_intelligence อ่าน human_state → action
    2. council_engine vote
    3. consensus_engine รวมผล
    """
    human_state = payload.get("human_state") or {}
    route       = payload.get("route", "general")
    text        = payload.get("text", "")

    # 1. decision_intelligence
    risk_proxy = {
        "level":      _route_to_risk_level(route),
        "risk_score": float(human_state.get("risk_score", 0)),
    }
    di = decision_intelligence(human_state, risk_proxy)

    # 2. council vote
    council_result = council_engine(di, human_state)

    # 3. consensus
    final = consensus_engine(council_result, human_state)

    return {
        "consensus":    final["final_action"],
        "message":      final["message"],
        "confidence":   final["confidence"],
        "action":       final["final_action"],
        "voters":       final["voters"],
        "tally":        final["tally"],
    }


def _route_to_risk_level(route: str) -> str:
    mapping = {
        "collapse": "CRITICAL",
        "survival": "HIGH",
        "risk":     "HIGH",
        "civil":    "MEDIUM",
        "vega":     "MEDIUM",
    }
    return mapping.get(route, "LOW")


# ══════════════════════════════════════════════════════════════════
# CORE — resolve (route=uncertain)
# ══════════════════════════════════════════════════════════════════
def resolve(pattern: dict) -> dict:
    """ใช้เมื่อ route = uncertain — ลดความคลุมเครือ ไม่บังคับตัดสินทันที"""
    pattern = pattern if isinstance(pattern, dict) else {}
    return {
        "route":      "uncertain",
        "resolution": "defer_commit",
        "notes": (
            "ยังไม่ควรฟันธง — รวบรวมข้อมูลอีกนิด "
            "หรือปรึกษาคนที่ไว้ใจได้ เพื่อลดความคลุมเครือ"
        ),
        "entropy":   pattern.get("entropy"),
        "resource":  pattern.get("resource"),
        "stability": pattern.get("stability"),
    }


# ══════════════════════════════════════════════════════════════════
# CORE — consensus_engine (รวมผลโหวต)
# ══════════════════════════════════════════════════════════════════
def consensus_engine(council_result: dict, state: dict = None) -> dict:
    state    = state or {}
    decision = council_result.get("decision", {})
    votes    = council_result.get("votes", [])

    tally = {}
    for vote in votes:
        action = vote.get("action", decision.get("action", "maintain"))
        tally[action] = tally.get(action, 0) + float(vote.get("score", 0))

    final_action = max(tally, key=tally.get) if tally else decision.get("action", "maintain")
    confidence   = round(min(100.0, max(0.0, float(council_result.get("score", 50)))), 2)

    return {
        "final_action": final_action,
        "message":      decision.get("message", ""),
        "confidence":   confidence,
        "tally":        tally,
        "voters":       len(votes),
    }
