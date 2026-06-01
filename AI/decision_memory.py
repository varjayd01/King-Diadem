# AI/decision_memory.py — KING DIADEM
# FIX: เพิ่ม dedup + timestamp + search — ไม่ใช่แค่ append list เปล่า

import time

_memory: list = []
_MAX = 200  # เก็บสูงสุด 200 entries ไม่ใช้ไฟล์ (ถ้าต้องการ persist ใช้ DATABASE/db.py)


def store_decision(question: str, options: list, route: str = "general",
                   result: str = None, tags: list = None) -> dict:
    """
    บันทึกการตัดสินใจพร้อม metadata
    คืน entry ที่บันทึกไว้
    """
    entry = {
        "id":        len(_memory) + 1,
        "timestamp": time.time(),
        "question":  str(question)[:500],
        "options":   options if isinstance(options, list) else [str(options)],
        "route":     route,
        "result":    result,
        "tags":      tags or [],
    }
    _memory.append(entry)
    # trim ถ้าเกิน max
    if len(_memory) > _MAX:
        _memory.pop(0)
    return entry


def get_memory(limit: int = 50) -> list:
    """คืน n entries ล่าสุด"""
    return _memory[-limit:]


def search_memory(keyword: str, limit: int = 20) -> list:
    """ค้นหาจาก question หรือ tags"""
    kw = keyword.lower()
    results = [
        m for m in _memory
        if kw in m["question"].lower()
        or any(kw in str(t).lower() for t in m.get("tags", []))
    ]
    return results[-limit:]


def clear_memory():
    """ล้าง memory — ใช้เมื่อ restart session"""
    _memory.clear()


def memory_stats() -> dict:
    return {
        "total":   len(_memory),
        "max":     _MAX,
        "routes":  _count_routes(),
        "oldest":  _memory[0]["timestamp"]  if _memory else None,
        "newest":  _memory[-1]["timestamp"] if _memory else None,
    }


def _count_routes() -> dict:
    counts = {}
    for m in _memory:
        r = m.get("route", "general")
        counts[r] = counts.get(r, 0) + 1
    return counts
