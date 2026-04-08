from __future__ import annotations


def evaluate_risk(text: str) -> dict:
    t = (text or "").casefold()

    score = 0

    if any(k in t for k in ("error", "พัง", "ล่ม", "traceback", "exception", "module not found", "500", "502", "503")):
        score += 2

    if any(k in t for k in ("deploy", "render", "github pages", "cors", "uvicorn", "fastapi", "start command")):
        score += 1

    if any(k in t for k in ("อดข้าว", "ไม่มีเงิน", "เงินหมด", "ตาย", "kill myself", "suicide", "ทำร้ายตัวเอง")):
        score += 3

    if any(k in t for k in ("now", "ด่วน", "เดี๋ยวนี้", "ทันที", "immediately", "urgent")):
        score += 1

    if score >= 4:
        level = "high"
    elif score >= 2:
        level = "medium"
    else:
        level = "low"

    return {
        "score": score,
        "level": level,
        "pause": level == "high",
    }
