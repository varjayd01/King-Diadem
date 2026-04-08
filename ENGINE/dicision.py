from __future__ import annotations


def _recent_lines(history: list[dict], limit: int = 3) -> list[str]:
    if not history:
        return []
    tail = history[-limit:]
    out = []
    for item in tail:
        text = (item or {}).get("text", "")
        if text:
            out.append(text)
    return out


def build_reply(message: str, intent: str, risk: dict, history: list[dict], seed: str, mode: str) -> dict:
    recent = _recent_lines(history, 3)
    base = "🪐 "

    if risk.get("pause"):
        return {
            "reply": base + "หยุดก่อน. ตัดงานให้สั้นลง แล้วแก้ทีละจุด. ตอนนี้ระบบบอกว่าเสี่ยงเกินไป",
            "actions": [
                "เช็คไฟล์ที่ Render รันจริง",
                "เช็ค start command",
                "เช็คว่าไฟล์ index.html อยู่ใน templates/",
            ],
            "context": recent,
            "intent": intent,
            "risk": risk,
            "mode": mode,
        }

    if intent == "deploy":
        return {
            "reply": (
                base
                + "Render ใช้ของนี้เท่านั้น: app.py ที่ root, templates/index.html, "
                  "start command = python -m uvicorn app:app --host 0.0.0.0 --port $PORT"
            ),
            "actions": [
                "Root directory ว่าง",
                "Build command = pip install -r requirements.txt",
                "Start command ใช้ python -m uvicorn",
            ],
            "context": recent,
            "intent": intent,
            "risk": risk,
            "mode": mode,
        }

    if intent == "ui":
        return {
            "reply": base + "UI อยู่ใน templates/index.html ทั้งก้อน. ปุ่มบวก, input, context window, chat shell มีให้ครบแล้ว",
            "actions": [
                "แก้ UI ที่ templates/index.html เท่านั้น",
                "ไม่ต้องไปแตะ GitHub Pages",
                "ใช้ Render สำหรับ backend",
            ],
            "context": recent,
            "intent": intent,
            "risk": risk,
            "mode": mode,
        }

    if intent == "debug":
        return {
            "reply": base + "อาการนี้คือโค้ดรันไม่ตรงจุด. เช็ค import, path ของไฟล์, และคำสั่ง start ให้ตรงกับ app.py",
            "actions": [
                "app.py ต้องอยู่ root",
                "engine/ ต้องมี __init__.py",
                "templates/ ต้องมี index.html",
            ],
            "context": recent,
            "intent": intent,
            "risk": risk,
            "mode": mode,
        }

    if intent == "auth":
        return {
            "reply": base + "โหมด auth ใช้หน้าเว็บได้. ถ้าจะเพิ่ม login ให้แยก endpoint อีกชั้น ไม่ต้องยัดทุกอย่างใส่ไฟล์เดียว",
            "actions": [
                "เพิ่มฟอร์มใน templates/index.html",
                "เพิ่ม route ใน app.py",
                "เก็บ state ใน engine/memory.py",
            ],
            "context": recent,
            "intent": intent,
            "risk": risk,
            "mode": mode,
        }

    if intent == "api":
        return {
            "reply": base + "API route พร้อมแล้วที่ /api/think และ /api/reset. หน้าเว็บยิง fetch มาที่ backend นี้ได้เลย",
            "actions": [
                "fetch ไป /api/think",
                "ส่ง message, mode, session_id, seed",
                "อ่าน reply จาก JSON",
            ],
            "context": recent,
            "intent": intent,
            "risk": risk,
            "mode": mode,
        }

    if intent == "help":
        return {
            "reply": base + "เอาแบบรอดจริง: แยก backend, แยก template, รันบน Render, และให้ index.html ยิงมาที่ /api/think",
            "actions": [
                "วาง app.py ที่ root",
                "วาง index.html ใน templates/",
                "ใช้ render.yaml หรือ start command ให้ตรง",
            ],
            "context": recent,
            "intent": intent,
            "risk": risk,
            "mode": mode,
        }

    if mode == "decision":
        return {
            "reply": base + "Decision mode: รับข้อความแล้ว, เก็บ state แล้ว, พร้อมตอบตาม intent โดยไม่พังโครง",
            "actions": [
                "ใช้ seed ได้",
                "ใช้ session_id ได้",
                "history ถูกเก็บไว้",
            ],
            "context": recent,
            "intent": intent,
            "risk": risk,
            "mode": mode,
        }

    return {
        "reply": base + f"รับแล้ว: {message}",
        "actions": [
            "ข้อความถูกเก็บใน context",
            "พร้อมส่งต่อให้สมอง",
        ],
        "context": recent,
        "intent": intent,
        "risk": risk,
        "mode": mode,
  }
