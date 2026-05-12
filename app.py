# ==========================================
# 👑 KING DIADEM — ULTIMATE app.py
# ==========================================

from fastapi import FastAPI, Request, File, UploadFile
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
import os, json, stripe

try:
    from ENGINE.decision_engine import DecisionEngine, run_decision as full_run_decision
except Exception:
    DecisionEngine = None
    full_run_decision = None

try:
    from ENGINE.human_engine import analyze_human
    from AI.intent_engine import analyze_intent
    from AI.freedom_signal import record_question, freedom_index, record_choice, record_crisis
except Exception as e:
    print(f"⚠ ENGINE IMPORT ERROR: {e}")
    analyze_human = analyze_intent = record_question = freedom_index = None
    record_choice = record_crisis = None

try:
    from core.llm_gemini import GeminiLLM
    from core.lyla_kernel import LylaKernel
    lyla = LylaKernel()
    llm = GeminiLLM(model="gemini-2.0-flash")
    print("✅ LYLA & Gemini Loaded")
except Exception as e:
    print(f"⚠ LLM/LYLA ERROR: {e}")
    llm = lyla = None

try:
    from DATABASE.db import init_db, log_decision, get_credits, add_credits
    init_db()
    print("✅ Database initialized")
except Exception as e:
    print(f"⚠ DB ERROR: {e}")
    init_db = log_decision = get_credits = add_credits = None

try:
    from AI.planetary_dashboard import planetary_status
    from AI.civilization_learning import record_learning, get_learning
    from AI.civilization_engine import add_node, get_nodes
    print("✅ Civilization Engine Loaded")
except Exception as e:
    print(f"⚠ CIVILIZATION ERROR: {e}")
    planetary_status = get_learning = get_nodes = None
    record_learning = add_node = None

try:
    from authlib.integrations.starlette_client import OAuth
    oauth = OAuth()
    oauth.register(
        name="google",
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )
    print("✅ Google OAuth Loaded")
except Exception as e:
    print(f"⚠ OAuth ERROR: {e}")
    oauth = None

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
app = FastAPI(title="KING DIADEM OS")
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY", "king-diadem-secret-2026"))
engine = DecisionEngine() if DecisionEngine else None

# static ก่อน route อื่นที่อาจชน path (ยกเว้น / ที่ประกาศแยก)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
@app.head("/")
def root():
    return FileResponse("static/index.html")


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


# ── DASHBOARD ─────────────────────────────────────────────────────
@app.get("/dashboard")
async def dashboard():
    try:
        status = planetary_status() if planetary_status else {}
    except Exception as e:
        status = {"error": str(e)}

    try:
        learning = get_learning() if get_learning else []
    except Exception:
        learning = []

    try:
        nodes = get_nodes() if get_nodes else []
    except Exception:
        nodes = []

    supply_chain = {
        "global_food_security": "DECLINING",
        "energy_drift_daily": 0.1,
        "water_stress_index": 72.4,
        "biodiversity_loss_rate": "0.01%/day",
        "choice_collapse_risk": "MODERATE",
        "lyla_signal": "Systems losing 0.1% choice daily — waterline monitoring active",
        "intervention_threshold": "Choice < 30%",
    }

    return {
        "observer": "KING DIADEM",
        "planetary": status,
        "supply_chain": supply_chain,
        "recent_learning": learning[-10:] if learning else [],
        "active_nodes": nodes[-10:] if nodes else [],
        "freedom_index": freedom_index() if freedom_index else 50,
        "sunyata_signal": "ทุกระบบว่างเปล่าจากการมีอยู่โดยตัวเอง — ทางเลือกเกิดจากความสัมพันธ์เท่านั้น",
    }


# ── GOOGLE LOGIN ──────────────────────────────────────────────────
@app.get("/login/google")
async def google_login(request: Request):
    if not oauth:
        return JSONResponse({"error": "OAuth not configured"}, status_code=500)
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "https://king-diadem.onrender.com/auth/google/callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get("/auth/google/callback")
async def google_callback(request: Request):
    if not oauth:
        return RedirectResponse("/static/login.html?error=oauth_disabled")
    try:
        token = await oauth.google.authorize_access_token(request)
        user = token.get("userinfo")
        email = user.get("email", "unknown")
        name = user.get("name", email)
        if get_credits and add_credits:
            credits = get_credits(email)
            if credits == 0:
                add_credits(email, 10)
        response = RedirectResponse("/")
        response.set_cookie("kd_email", email, max_age=86400 * 30)
        response.set_cookie("kd_name", name, max_age=86400 * 30)
        return response
    except Exception as e:
        return RedirectResponse(f"/static/login.html?error={str(e)[:50]}")


@app.get("/me")
async def me(request: Request):
    email = request.cookies.get("kd_email")
    name = request.cookies.get("kd_name")
    if not email:
        return {"logged_in": False}
    credits = get_credits(email) if get_credits else 0
    return {"logged_in": True, "email": email, "name": name, "credits": credits}


@app.post("/logout")
async def logout():
    response = JSONResponse({"status": "ok"})
    response.delete_cookie("kd_email")
    response.delete_cookie("kd_name")
    return response


@app.post("/register")
async def register(data: dict):
    email = data.get("email", "")
    if not email:
        return {"status": "error", "message": "กรุณากรอก email"}
    if add_credits and get_credits:
        if get_credits(email) == 0:
            add_credits(email, 10)
    return {"status": "ok", "email": email, "credits": 10}


@app.post("/login")
async def login_email(data: dict):
    email = data.get("email", "")
    if not email:
        return {"status": "error"}
    credits = get_credits(email) if get_credits else 0
    response = JSONResponse({"status": "ok", "email": email, "credit": credits})
    response.set_cookie("kd_email", email, max_age=86400 * 30)
    return response


def _route_bias(route: str, text: str) -> str:
    if not route or route == "general":
        return text
    tags = {
        "risk": "[โหมด: ประเมินความเสี่ยง/ผลกระทบ]",
        "survival": "[โหมด: ความอยู่รอดพื้นฐาน — อาหาร ที่พัก ความปลอดภัย]",
        "collapse": "[โหมด: ลูกโซ่ความเสียหาย/แรงกดดันสะสม]",
        "civil": "[โหมด: งาน/พลเมือง/ความรับผิดชอบต่อส่วนรวม]",
        "vega": "[โหมด: อนาคต/โลกกว้าง/ทางเลือกระยะยาว]",
    }
    return f"{tags.get(route, '')} {text}".strip()


# ── DECISION ENGINE ───────────────────────────────────────────────
@app.post("/run")
@app.post("/decision")
async def run_kernel(request: Request, data: dict):
    user_input = data.get("input") or data.get("text") or ""
    if not user_input:
        return {"error": "Input is required"}

    email = request.cookies.get("kd_email", "anonymous")

    if record_question:
        record_question()

    human_state = (
        analyze_human(data.get("context", {}))
        if analyze_human
        else {"entropy": 40, "resource": 50, "stability": 60, "risk_score": 10}
    )
    intent = analyze_intent(user_input) if analyze_intent else {"intent": "general", "confidence": 0.5}

    route = data.get("route") or "general"
    payload = {**data, "input": _route_bias(route, user_input)}

    if full_run_decision:
        result = full_run_decision(payload)
    elif engine:
        result = engine.run(payload)
    else:
        if llm:
            try:
                reply = llm.generate_with_governance(
                    prompt=user_input,
                    additional_context=f"entropy={human_state.get('entropy')}, stability={human_state.get('stability')}",
                )
            except Exception as e:
                reply = f"[Gemini Error: {e}]"
        else:
            reply = "[KING DIADEM — Offline]\n— Fail Less. Harm Less. Restore Choice. —"

        result = {
            "observer": "KING DIADEM",
            "status": "SUCCESS",
            "route": intent.get("intent", "general") if isinstance(intent, dict) else "general",
            "ai_response": reply,
            "governance": {"intent": intent, "human_state": human_state},
        }

    result["route"] = result.get("route") or route

    if log_decision and result.get("ai_response"):
        try:
            log_decision(
                email,
                user_input,
                result.get("route", "general"),
                str(result.get("ai_response", "")),
            )
        except Exception:
            pass

    if record_learning and result.get("ai_response"):
        try:
            record_learning(
                question=user_input,
                decision=result.get("route", "general"),
                planet_context={
                    "entropy": human_state.get("entropy"),
                    "stability": human_state.get("stability"),
                },
                success=None,
            )
        except Exception:
            pass

    if record_choice:
        record_choice()

    return result


# ── SIMULATE ──────────────────────────────────────────────────────
@app.post("/simulate")
async def simulate_future(data: dict):
    user_input = data.get("input", "")
    paths = data.get("paths") or []
    extra = ""
    if paths:
        extra = "\nทางเลือกที่ผู้ใช้ระบุ:\n" + "\n".join(f"- {p}" for p in paths if str(p).strip())
    if not llm:
        return {"status": "OFFLINE", "message": "LLM not found"}
    try:
        raw = llm.generate_with_governance(
            prompt=f"จำลองอนาคต 30/90/365 วัน: {user_input}",
            additional_context="mode=simulation, analyze paths and risks, include supply chain and resource signals"
            + extra,
        )
    except Exception as e:
        raw = f"Simulation error: {e}"
    observation = lyla.observe(user_input) if lyla else {"stability": "NOMINAL"}
    return {"status": "SUCCESS", "simulation": raw, "lyla_observation": observation}


# ── IMAGE ANALYSIS ────────────────────────────────────────────────
@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    if not llm:
        return {"status": "OFFLINE", "message": "LLM not found"}
    try:
        from google import genai
        from google.genai import types

        content = await file.read()
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY2"))
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_bytes(data=content, mime_type=file.content_type or "image/jpeg"),
                        types.Part.from_text(
                            text="""วิเคราะห์ภาพนี้ผ่าน LYLA Governance Framework:
1. สิ่งที่เห็นในภาพคืออะไร
2. มี drift หรือความเสี่ยงที่ซ่อนอยู่ไหม
3. ทางเลือกที่แนะนำ (≤3 ทาง)
ตอบด้วยเมตตา ไม่ตัดสิน"""
                        ),
                    ],
                )
            ],
        )
        return {"status": "SUCCESS", "analysis": response.text, "filename": file.filename}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/upload-image")
async def upload_image_alias(file: UploadFile = File(...)):
    """alias สำหรับหน้าเว็บเดิมที่เรียก /upload-image"""
    return await analyze_image(file)


# ── PAYMENT ───────────────────────────────────────────────────────
@app.post("/payment/create-checkout")
async def create_checkout(request: Request):
    payload = await request.json()
    plan = payload.get("plan", "basic")
    email = (
        payload.get("email")
        or payload.get("api_key")
        or request.cookies.get("kd_email", "guest")
    )

    plans = {
        "basic": {"amount": 29900, "currency": "thb", "name": "KING DIADEM Basic — ฿299/เดือน"},
        "civilization": {"amount": 99900, "currency": "thb", "name": "KING DIADEM Civilization — ฿999/เดือน"},
        "topup": {"amount": 5000, "currency": "thb", "name": "KING DIADEM Credits — ฿50"},
    }
    p = plans.get(plan, plans["basic"])

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": p["currency"],
                        "product_data": {"name": p["name"]},
                        "unit_amount": p["amount"],
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url="https://king-diadem.onrender.com/success?plan=" + plan,
            cancel_url="https://king-diadem.onrender.com/",
            customer_email=email if "@" in str(email) else None,
            metadata={"email": str(email), "plan": plan},
        )
        return {"url": session.url}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.get("/success")
async def success():
    return FileResponse("static/index.html")


@app.get("/cancel")
async def cancel():
    return FileResponse("static/index.html")


@app.get("/credits")
async def credits(request: Request):
    email = request.cookies.get("kd_email", "anonymous")
    c = get_credits(email) if get_credits else 0
    return {"email": email, "credits": c}
