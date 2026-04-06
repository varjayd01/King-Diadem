from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from engine import KingDiademEngine

app = FastAPI()
engine = KingDiademEngine()

# -------------------------
# MODEL
# -------------------------
class RequestModel(BaseModel):
    text: str
    mode: str = "chat"  # chat | decision


# -------------------------
# HEALTH CHECK
# -------------------------
@app.get("/")
def home():
    return {"status": "KING DIADEM ONLINE"}


# -------------------------
# CORE ENDPOINT (ตัวเดียวจบ)
# -------------------------
@app.post("/run")
def run(req: RequestModel):
    try:
        result = engine.run(req.text, req.mode)

        return {
            "status": "ok",
            "result": result
        }

    except Exception as e:
        return {
            "status": "fallback",
            "error": str(e),
            "options": [
                "ลองใหม่อีกครั้ง",
                "ลดความซับซ้อนของคำถาม",
                "หยุดพัก (SYSTEM PAUSE)"
            ]
        }
