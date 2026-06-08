# AI/reality_learning.py — KING DIADEM
# ระบบเรียนรู้จากผลลัพธ์จริง — บันทึก, วัด, ปรับ drift
# record_outcome → เก็บ node พร้อม weight
# learning_summary → คืน signal คมพร้อม score/drift_risk

from __future__ import annotations
import time
from collections import deque
from typing import Literal

# ── in-memory log (ไม่เกิน 200 nodes) ──────────────────────
_LOG: deque[dict] = deque(maxlen=200)

OutcomeT = Literal["positive", "negative", "neutral", "unknown"]

# ── outcome → numeric score ──────────────────────────────────
_SCORE = {"positive": 1.0, "neutral": 0.5, "negative": 0.0, "unknown": 0.5}


def record_outcome(
    question: str,
    decision: str,
    outcome: OutcomeT,
    *,
    route: str = "general",
    confidence: float = 0.5,
    tags: list[str] | None = None,
) -> dict:
    """
    บันทึก 1 node พร้อม metadata
    คืน node ที่เก็บไว้ (ใช้ debug/test ได้)
    """
    node = {
        "ts":         time.time(),
        "question":   str(question)[:300],
        "decision":   str(decision)[:300],
        "outcome":    outcome if outcome in _SCORE else "unknown",
        "route":      route,
        "confidence": max(0.0, min(1.0, float(confidence))),
        "tags":       tags or [],
        "score":      _SCORE.get(outcome, 0.5),
    }
    _LOG.append(node)
    return node


def learning_summary() -> dict:
    """
    วิเคราะห์ log ทั้งหมด คืน:
      total, positive, negative, neutral,
      score (0-100), signal, drift_risk, win_rate,
      recent_trend, top_routes
    """
    nodes = list(_LOG)
    total = len(nodes)

    if total == 0:
        return {
            "total":        0,
            "positive":     0,
            "negative":     0,
            "neutral":      0,
            "score":        50,
            "signal":       "NO_DATA",
            "drift_risk":   "UNKNOWN",
            "win_rate":     0.0,
            "recent_trend": "FLAT",
            "top_routes":   [],
        }

    pos  = sum(1 for n in nodes if n["outcome"] == "positive")
    neg  = sum(1 for n in nodes if n["outcome"] == "negative")
    neut = sum(1 for n in nodes if n["outcome"] == "neutral")

    # weighted score — confidence ทำให้ node ที่มั่นใจสูงมีน้ำหนักมากกว่า
    weighted_scores = [n["score"] * (0.5 + 0.5 * n["confidence"]) for n in nodes]
    raw_score = sum(weighted_scores) / len(weighted_scores)
    score = round(raw_score * 100, 1)

    win_rate = round(pos / total * 100, 1) if total else 0.0

    # recent trend — เปรียบ 25% หลัง vs 25% แรก
    quarter = max(1, total // 4)
    early   = sum(n["score"] for n in nodes[:quarter])  / quarter
    recent  = sum(n["score"] for n in nodes[-quarter:]) / quarter
    delta   = recent - early
    if delta > 0.12:
        trend = "IMPROVING"
    elif delta < -0.12:
        trend = "DEGRADING"
    else:
        trend = "FLAT"

    # drift risk — ถ้า negative rate สูงหรือ score ตก
    neg_rate = neg / total if total else 0
    if neg_rate > 0.5 or score < 30:
        drift_risk = "HIGH"
    elif neg_rate > 0.3 or score < 45:
        drift_risk = "MODERATE"
    else:
        drift_risk = "LOW"

    # signal คม
    if score >= 70 and trend == "IMPROVING":
        signal = "EXPANDING"
    elif score >= 55:
        signal = "STABLE"
    elif score >= 40 and trend != "DEGRADING":
        signal = "CAUTION"
    elif drift_risk == "HIGH":
        signal = "DRIFT_ALERT"
    else:
        signal = "COMPRESSION"

    # top routes — route ที่ positive rate ดีสุด
    route_stats: dict[str, list[float]] = {}
    for n in nodes:
        route_stats.setdefault(n["route"], []).append(n["score"])
    top_routes = sorted(
        [{"route": k, "score": round(sum(v)/len(v)*100, 1)} for k, v in route_stats.items()],
        key=lambda x: -x["score"]
    )[:4]

    return {
        "total":        total,
        "positive":     pos,
        "negative":     neg,
        "neutral":      neut,
        "score":        score,
        "signal":       signal,
        "drift_risk":   drift_risk,
        "win_rate":     win_rate,
        "recent_trend": trend,
        "top_routes":   top_routes,
    }


def get_learning(limit: int = 50) -> list[dict]:
    """คืน node ล่าสุด N รายการ"""
    return list(_LOG)[-limit:]


def reset_learning() -> int:
    """ล้าง log ทั้งหมด — คืนจำนวนที่ลบ (ใช้ testing/admin)"""
    count = len(_LOG)
    _LOG.clear()
    return count
