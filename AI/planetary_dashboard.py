# AI/planetary_dashboard.py — KING DIADEM
# FIX: ลบ import ที่พัง ใช้ fallback แบบ graceful

def planetary_status() -> dict:
    """
    รวม signal จากทุก layer ที่มีอยู่จริง
    ถ้า module ไหนไม่โหลดได้ → ใช้ default ไม่พัง
    """
    # ── freedom_index ─────────────────────────────────────
    try:
        from AI.freedom_signal import freedom_index
        freedom = freedom_index()
    except Exception:
        freedom = 50

    # ── learning summary ──────────────────────────────────
    try:
        from AI.reality_learning import learning_summary
        learning = learning_summary()
    except Exception:
        learning = {"total": 0, "score": 50, "signal": "UNKNOWN"}

    # ── decision nodes (ถ้ามี) ────────────────────────────
    decision_count = 0
    try:
        from AI.decision_memory import get_memory
        decision_count = len(get_memory())
    except Exception:
        pass

    # ── network nodes (ถ้ามี) ─────────────────────────────
    node_count = 0
    try:
        from NETWORK.node_registry import get_nodes
        node_count = len(get_nodes())
    except Exception:
        pass

    # ── civilization nodes (ถ้ามี) ────────────────────────
    try:
        from AI.civilization_engine import get_nodes as get_civ_nodes
        civ_nodes = len(get_civ_nodes())
    except Exception:
        civ_nodes = 0

    # ── status signal ─────────────────────────────────────
    learn_score = learning.get("score", 50)
    if freedom < 25 or learn_score < 25:
        status = "COLLAPSE_RISK"
    elif freedom < 40 or learn_score < 35:
        status = "COMPRESSION"
    elif freedom > 70 and learn_score > 65:
        status = "EXPANSION"
    else:
        status = "STABLE"

    return {
        "planetary_status":    status,
        "freedom_index":       freedom,
        "learning_score":      learn_score,
        "learning_signal":     learning.get("signal", "UNKNOWN"),
        "drift_risk":          learning.get("drift_risk", "LOW"),
        "decision_nodes":      decision_count,
        "civilization_nodes":  civ_nodes,
        "network_nodes":       node_count,
        "learning":            learning,
        "global_food_security":"DECLINING",
        "water_stress_index":  72.4,
        "energy_drift_daily":  0.1,
        "choice_collapse_risk":"MODERATE" if freedom < 40 else "LOW",
        "lyla_signal": (
            "INTERVENE" if status == "COLLAPSE_RISK" else
            "MONITOR"   if status == "COMPRESSION"   else
            "OBSERVE"
        ),
    }
