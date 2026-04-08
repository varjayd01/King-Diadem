from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

app = FastAPI()

# ✅ CORS (สำคัญมาก)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ route test
@app.get("/")
def home():
    return {"status": "alive"}

# ✅ CHAT API (ตัวเชื่อมจริง)
@app.post("/chat")
async def chat(req: Request):
    data = await req.json()
    user_input = data.get("message", "")

    # 👇 ตรงนี้ค่อยเอา decision_mode มายัดทีหลัง
    return JSONResponse({
        "reply": f"ระบบรับแล้ว: {user_input}"
    })
