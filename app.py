from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import os
import stripe

app = FastAPI()

# =========================
# STATIC
# =========================
@app.get("/")
def root():
    return FileResponse("static/index.html")

app.mount("/static", StaticFiles(directory="static"), name="static")

# =========================
# FAKE DB
# =========================
USERS = {}

# =========================
# ENGINE LOAD
# =========================
try:
    from ENGINE.decision_engine import DecisionEngine
    engine = DecisionEngine()
except Exception as e:
    print("ENGINE LOAD ERROR:", e)
    engine = None

# =========================
# RUN ENGINE (ตัวหลัก)
# =========================
@app.post("/run")
async def run_engine(data: dict):

    user_input = data.get("input") or data.get("text") or ""

    payload = {
        "input": user_input
    }

    # fallback ถ้า engine ไม่มี
    if not engine:
        return {
            "observer": "KING DIADEM",
            "status": "ENGINE OFFLINE",
            "fallback": [
                "ลดการใช้ทรัพยากร",
                "หาความร่วมมือ",
                "รักษาความปลอดภัย",
                "ย้ายไปพื้นที่เสี่ยงต่ำ"
            ]
        }

    try:
        result = engine.run(payload)
        return result

    except Exception as e:
        return {
            "observer": "KING DIADEM",
            "error": str(e),
            "fallback": [
                "รักษาสถานการณ์",
                "ลดความเสี่ยง",
                "ขอความช่วยเหลือ",
                "หลีกเลี่ยงการตัดสินใจเร่งด่วน"
            ]
        }

# =========================
# ALIAS (กันพลาด)
# =========================
@app.post("/decision")
async def decision_alias(data: dict):
    return await run_engine(data)

# =========================
# HEALTH
# =========================
@app.get("/health")
def health():
    return {"status": "alive 👑"}
