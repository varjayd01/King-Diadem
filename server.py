from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import os
from google import genai

app = FastAPI()

# ===== GEMINI CLIENT =====
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# ===== STATIC =====
app.mount("/static", StaticFiles(directory="static"), name="static")

# ===== ROOT =====
@app.get("/", response_class=HTMLResponse)
async def index():
    with open("index.html", "r", encoding="utf-8") as f:
        return f.read()

# ===== HEALTH =====
@app.get("/system/health")
async def health():
    return {
        "status": "OK",
        "engine": "KING DIADEM",
        "mode": "ACTIVE"
    }

# ===== DECISION ENGINE =====
def king_filter(text):
    # 🔥 ปติจสมุปบาท filter (basic)
    illusion_words = ["อยาก", "ต้องมี", "กูต้องได้"]
    for w in illusion_words:
        if w in text:
            return "⚠️ ตรวจพบอุปาทาน → ลดแรงยึดก่อนตัดสินใจ"
    return None

def run_gemini(prompt):
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    return response.text

# ===== API =====
@app.post("/decision")
async def decision(request: Request):
    data = await request.json()
    user_input = data.get("input", "")
    mode = data.get("mode", "normal")

    # 🔥 Layer 1: Reality filter
    check = king_filter(user_input)
    if check:
        return {"result": check}

    # ===== MODE =====
    if mode == "council":
        prompts = [
            f"[KING DIADEM] วิเคราะห์เชิงโครงสร้าง:\n{user_input}",
            f"[LYLA] มองเชิงโอกาส:\n{user_input}",
            f"[VEGA] มองความเสี่ยง:\n{user_input}",
            f"[FATE] ทางเลือกที่เหลือ:\n{user_input}"
        ]

        results = [run_gemini(p) for p in prompts]

        return {
            "result": "\n\n".join(results)
        }

    # ===== NORMAL =====
    reply = run_gemini(user_input)

    return {
        "result": f"KING DIADEM:\n{reply}"
    }
