# ==========================================
# 👑 KING DIADEM — ULTIMATE app.py
# ==========================================

from fastapi import FastAPI, Request, File, UploadFile
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
import os, json, stripe
from PIL import Image, ExifTags

try:
    from ENGINE.decision_engine import DecisionEngine
    from ENGINE.council_engine import council_engine
    from ENGINE.consensus_engine import consensus_engine
    from ENGINE.human_engine import analyze_human
    from AI.intent_engine import analyze_intent
    from AI.freedom_signal import record_question, freedom_index
except Exception as e:
    print(f"⚠ ENGINE IMPORT ERROR: {e}")
    DecisionEngine = council_engine = consensus_engine = None
    analyze_human = analyze_intent = record_question = freedom_index = None

try:
    from core.llm_gemini import GeminiLLM
    from core.lyla_kernel import LylaKernel
    from core.axioms import AXIOMS
    lyla = LylaKernel()
    llm = GeminiLLM(model="gemini-2.0-flash")
    print("✅ LYLA & Gemini Loaded")
except Exception as e:
    print(f"⚠ LLM/LYLA ERROR: {e}")
    llm = lyla = None
    AXIOMS = {}

try:
    from DATABASE.db import init_db, log_decision, get_credits
    from PAYMENT.stripe_webhook import handle_webhook
    init_db()
    print("✅ Database initialized")
except Exception as e:
    print(f"⚠ DB/Payment ERROR: {e}")
    init_db = log_decision = get_credits = None
    handle_webhook = None

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
app = FastAPI(title="KING DIADEM OS")
engine = DecisionEngine() if DecisionEngine else None

@app.get("/")
@app.head("/")
def root():
    return FileResponse("static/index.html")

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/health")
def health():
    return {
        "status": "alive 👑",
        "llm_loaded": llm is not None,
        "engine_loaded": engine is not None,
        "lyla_loaded": lyla is not None,
        "stripe_loaded": bool(os.getenv("STRIPE_SECRET_KEY")),
        "freedom_score": freedom_index() if freedom_index else 0,
        "db_initialized": init_db is not None,
    }

@app.post("/run")
@app.post("/decision")
async def run_kernel(data: dict):
    user_input = data.get("input") or data.get("text") or ""
    if not user_input:
        return {"error": "Input is required"}

    if record_question:
        record_question()

    human_state = analyze_human(data.get("context", {})) if analyze_human else {"entropy": 40, "resource": 50, "stability": 60, "risk_score": 10}
    intent = analyze_intent(user_input) if analyze_intent else {"intent": "general", "confidence": 0.5}

    if engine:
        result = engine.run(data)
    else:
        if llm:
            try:
                reply = llm.generate_with_governance(
                    prompt=user_input,
                    additional_context=f"entropy={human_state.get('entropy')}, stability={human_state.get('stability')}"
                )
            except Exception as e:
                reply = f"[Gemini Error: {e}]"
        else:
            reply = f"[KING DIADEM — Offline]\n{user_input}\n— Fail Less. Harm Less. Restore Choice. —"

        result = {
            "observer": "KING DIADEM",
            "status": "SUCCESS",
            "route": intent.get("intent", "general") if isinstance(intent, dict) else "general",
            "ai_response": reply,
            "governance": {"intent": intent, "human_state": human_state}
        }

    if log_decision and result.get("ai_response"):
        try:
            log_decision("anonymous", user_input, result.get("route", "general"), str(result.get("ai_response", "")))
        except Exception:
            pass

    return result

@app.post("/simulate")
async def simulate_future(data: dict):
    user_input = data.get("input", "")
    if not llm:
        return {"status": "OFFLINE", "message": "LLM not found"}
    try:
        raw = llm.generate_with_governance(
            prompt=f"จำลองอนาคต 30/90/365 วัน: {user_input}",
            additional_context="mode=simulation, analyze paths and risks"
        )
    except Exception as e:
        raw = f"Simulation error: {e}"
    observation = lyla.observe(user_input) if lyla else {"stability": "NOMINAL"}
    return {"status": "SUCCESS", "simulation": raw, "lyla_observation": observation}

@app.post("/payment/create-checkout")
async def create_checkout(request: Request):
    payload = await request.json()
    api_key = payload.get("api_key") or payload.get("email") or "guest"
    plan = payload.get("plan", "basic")
    price_id_basic = os.getenv("STRIPE_PRICE_ID")
    price_id_civil = os.getenv("STRIPE_PRICE_ID_CIVIL")

    try:
        if plan == "civil" and price_id_civil:
            line_items = [{"price": price_id_civil, "quantity": 1}]
        elif plan == "basic" and price_id_basic:
            line_items = [{"price": price_id_basic, "quantity": 1}]
        else:
            amount = 500 if plan == "basic" else 29900
            currency = "usd" if plan == "basic" else "thb"
            label = "King Diadem Basic" if plan == "basic" else "King Diadem Civilization"
            line_items = [{
                "price_data": {
                    "currency": currency,
                    "product_data": {"name": label},
                    "unit_amount": amount
                },
                "quantity": 1
            }]

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url="https://king-diadem.onrender.com/success",
            cancel_url="https://king-diadem.onrender.com/cancel",
            metadata={"api_key": api_key, "plan": plan}
        )
        return {"url": session.url}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...), email: str = "guest"):
    try:
        image = Image.open(file.file)
        exif_data = image._getexif() or {}
        parsed = {}
        for tag, value in exif_data.items():
            decoded = ExifTags.TAGS.get(tag, tag)
            parsed[decoded] = value

        date_time = parsed.get("DateTimeOriginal") or parsed.get("DateTime") or parsed.get("DateTimeDigitized")
        message = "ไม่พบข้อมูลวันเวลาในรูปภาพ กรุณาถ่ายรูปด้วยกล้องที่บันทึกเวลาและวันที่"
        if date_time:
            message = f"พบ timestamp: {date_time}. ใช้เป็นหลักฐานสำหรับ Timeline ได้"

        timeline = {
            "email": email,
            "filename": file.filename,
            "content_type": file.content_type,
            "timestamp": date_time,
            "exif": {k: str(v) for k, v in parsed.items() if k in ["DateTimeOriginal", "DateTime", "DateTimeDigitized"]}
        }

        return {
            "status": "SUCCESS",
            "message": message,
            "timeline": timeline,
            "recommendation": "ใช้รูปภาพพร้อมเวลา/วันที่เป็นหลักฐานประกอบการตัดสินใจและการรายงาน"
        }
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@app.get("/credits")
async def credits(email: str = "anonymous"):
    if get_credits:
        return {"email": email, "credits": get_credits(email)}
    return {"credits": 0}
