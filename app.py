# =========================
# 👑 KING DIADEM — app.py v4.0
# LYLA (หญิง/ค่ะ) · VEGA (ชาย/ครับ) · ปฏิจสมุปบาท · โยนิโสมนสิการ · สุญยตา
# Fail less. Harm less. Restore more.
# =========================

from fastapi import FastAPI, Request, File, UploadFile
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
import os, json, stripe
from urllib.parse import quote, unquote

# ── ENGINE ────────────────────────────────────────────────────────
try:
    from ENGINE.decision_engine import DecisionEngine, run_decision as full_run_decision
except Exception as e:
    print(f"⚠ DecisionEngine: {e}")
    DecisionEngine = None
    full_run_decision = None

try:
    from ENGINE.human_engine import analyze_human
except Exception:
    analyze_human = None

try:
    # UDOK v2.0: analyze() คือ adapter, suffering_infrastructure คือ core
    from ENGINE.paticcasamuppada_engine import analyze as analyze_chain
except Exception as e:
    print(f"⚠ paticcasamuppada: {e}")
    analyze_chain = None

try:
    from ENGINE.collapse_predictor import predict_collapse
except Exception as e:
    print(f"⚠ collapse_predictor: {e}")
    predict_collapse = None

try:
    # consensus_engine.py export: build_consensus (public API) + consensus_engine (core)
    from ENGINE.consensus_engine import build_consensus
except Exception as e:
    print(f"⚠ consensus_engine: {e}")
    build_consensus = None

try:
    # simulation_engine.py export: simulate (public API) + simulate_future (core)
    from ENGINE.simulation_engine import simulate
except Exception as e:
    print(f"⚠ simulation_engine: {e}")
    simulate = None

try:
    # risk_engine.py มี assess() ✓
    from ENGINE.risk_engine import assess as assess_risk
except Exception as e:
    print(f"⚠ risk_engine: {e}")
    assess_risk = None

try:
    from ENGINE.realhuman_survivorengine import (
        RealHumanSurvivorEngine,
        parse_state_from_context,
    )
    _survivor_engine = RealHumanSurvivorEngine()

    def survivor_analyze(text, context):
        state = parse_state_from_context(context or {})
        out = _survivor_engine.run(state)
        return {
            "context":    out.context_for_lyla,
            "can_decide": out.can_decide,
            "status":     out.status,
            "route":      "survival" if not out.can_decide else "general",
        }
except Exception as e:
    print(f"⚠ survivor_engine: {e}")
    survivor_analyze = None

try:
    from AI.intent_engine import analyze_intent
    from AI.freedom_signal import record_question, freedom_index, record_choice, record_crisis
except Exception as e:
    print(f"⚠ AI MODULE: {e}")
    analyze_intent = record_question = freedom_index = None
    record_choice = record_crisis = None

# ── CORE ──────────────────────────────────────────────────────────
try:
    from core.llm_gemini import GeminiLLM
    from core.lyla_kernel import LylaKernel
    lyla = LylaKernel()
    llm  = GeminiLLM(model="gemini-2.0-flash")
    print("✅ LYLA & Gemini loaded")
except Exception as e:
    print(f"⚠ LLM/LYLA: {e}")
    llm = lyla = None

try:
    from core.system_orchestrator import get_orchestrator
    orchestrator = get_orchestrator()
    print("✅ Orchestrator loaded")
except Exception as e:
    print(f"⚠ Orchestrator: {e}")
    orchestrator = None

# ── DATABASE ──────────────────────────────────────────────────────
try:
    from DATABASE.db import (
        init_db, log_decision, get_credits, add_credits,
        ensure_user, save_chat_state, load_chat_state,
    )
    init_db()
    print("✅ Database initialized")
except Exception as e:
    print(f"⚠ DB: {e}")
    init_db = log_decision = get_credits = add_credits = None
    ensure_user = save_chat_state = load_chat_state = None

# ── CIVILIZATION ──────────────────────────────────────────────────
try:
    from AI.planetary_dashboard import planetary_status
    from AI.civilization_learning import record_learning, get_learning
    from AI.civilization_engine import add_node, get_nodes
    print("✅ Civilization loaded")
except Exception as e:
    print(f"⚠ CIVILIZATION: {e}")
    planetary_status = get_learning = get_nodes = None
    record_learning = add_node = None

# ── GOOGLE OAUTH ──────────────────────────────────────────────────
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
    print("✅ Google OAuth loaded")
except Exception as e:
    print(f"⚠ OAuth: {e}")
    oauth = None

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# ── APP ───────────────────────────────────────────────────────────
app = FastAPI(title="KING DIADEM OS")
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "king-diadem-secret-2026")
)
engine = DecisionEngine() if DecisionEngine else None
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
@app.head("/")
def root():
    return FileResponse("static/index.html")


@app.get("/favicon.ico")
def favicon():
    return FileResponse("static/logo.png")


# ── HEALTH ────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status":             "alive 👑",
        "llm_loaded":         llm is not None,
        "engine_loaded":      engine is not None,
        "lyla_loaded":        lyla is not None,
        "paticcasamuppada":   analyze_chain is not None,
        "collapse_predictor": predict_collapse is not None,
        "consensus_engine":   build_consensus is not None,
        "simulation_engine":  simulate is not None,
        "risk_engine":        assess_risk is not None,
        "survivor_engine":    survivor_analyze is not None,
        "stripe_loaded":      bool(os.getenv("STRIPE_SECRET_KEY")),
        "freedom_score":      freedom_index() if freedom_index else 0,
        "db_initialized":     init_db is not None,
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
    return {
        "observer":    "KING DIADEM",
        "planetary":   status,
        "supply_chain": {
            "global_food_security":   "DECLINING",
            "energy_drift_daily":     0.1,
            "water_stress_index":     72.4,
            "choice_collapse_risk":   "MODERATE",
            "lyla_signal":            "Systems losing 0.1% choice daily",
            "intervention_threshold": "Choice < 30%",
        },
        "recent_learning": learning[-10:] if learning else [],
        "active_nodes":    nodes[-10:]    if nodes    else [],
        "freedom_index":   freedom_index() if freedom_index else 50,
    }


# ── GOOGLE OAUTH ──────────────────────────────────────────────────
def _cookie_ascii(value: str) -> str:
    return quote(str(value or ""), safe="")


@app.get("/login/google")
async def google_login(request: Request):
    if not oauth:
        return JSONResponse({"error": "OAuth not configured"}, status_code=500)
    redirect_uri = os.getenv(
        "GOOGLE_REDIRECT_URI",
        "https://king-diadem.onrender.com/auth/google/callback"
    )
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get("/auth/google/callback")
async def google_callback(request: Request):
    if not oauth:
        return RedirectResponse("/static/login.html?error=oauth_disabled")
    try:
        token = await oauth.google.authorize_access_token(request)
        user  = token.get("userinfo")
        email = user.get("email", "unknown")
        name  = user.get("name", email)
        if ensure_user:
            ensure_user(email)
        if get_credits and add_credits and get_credits(email) == 0:
            add_credits(email, 10)
        try:
            sess = getattr(request, "session", None)
            if sess is not None:
                for k in list(sess.keys()):
                    if isinstance(k, str) and (
                        k.startswith("_state") or "oauth" in k.lower() or k.endswith("_token")
                    ):
                        sess.pop(k, None)
        except Exception:
            pass
        response = RedirectResponse("/")
        response.set_cookie("kd_email", _cookie_ascii(email), max_age=86400 * 30)
        response.set_cookie("kd_name",  _cookie_ascii(name),  max_age=86400 * 30)
        return response
    except Exception as e:
        print(f"google_callback error: {repr(e)}")
        return RedirectResponse("/static/login.html?error=oauth_error")


@app.get("/me")
async def me(request: Request):
    email = unquote(request.cookies.get("kd_email") or "")
    name  = unquote(request.cookies.get("kd_name")  or "")
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


# ── EMAIL LOGIN / REGISTER ────────────────────────────────────────
@app.post("/register")
async def register(data: dict):
    email = (data.get("email") or "").strip()
    if not email:
        return {"status": "error", "message": "กรุณากรอก email"}
    if ensure_user:
        ensure_user(email)
    if add_credits and get_credits and get_credits(email) == 0:
        add_credits(email, 10)
    credits = get_credits(email) if get_credits else 0
    response = JSONResponse({"status": "ok", "email": email, "credits": credits})
    response.set_cookie("kd_email", _cookie_ascii(email), max_age=86400 * 30)
    response.set_cookie("kd_name",  _cookie_ascii(email), max_age=86400 * 30)
    return response


@app.post("/login")
async def login_email(data: dict):
    email = (data.get("email") or "").strip()
    if not email:
        return {"status": "error"}
    if ensure_user:
        ensure_user(email)
    credits = get_credits(email) if get_credits else 0
    response = JSONResponse({"status": "ok", "email": email, "credit": credits})
    response.set_cookie("kd_email", _cookie_ascii(email), max_age=86400 * 30)
    nm = (data.get("name") or email).strip()
    response.set_cookie("kd_name", _cookie_ascii(nm), max_age=86400 * 30)
    return response


# ── CHAT STATE ────────────────────────────────────────────────────
@app.get("/api/chat-state")
async def get_chat_state(request: Request):
    email = unquote(request.cookies.get("kd_email") or "").strip()
    if not email or not load_chat_state:
        return {"state": None}
    raw = load_chat_state(email)
    if not raw:
        return {"state": None}
    try:
        return {"state": json.loads(raw)}
    except Exception:
        return {"state": None}


@app.put("/api/chat-state")
async def put_chat_state(request: Request, data: dict):
    email = unquote(request.cookies.get("kd_email") or "").strip()
    if not email or not save_chat_state:
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)
    state = data.get("state") if isinstance(data.get("state"), dict) else data
    if not isinstance(state, dict):
        return JSONResponse({"ok": False, "error": "invalid"}, status_code=400)
    save_chat_state(email, json.dumps(state, ensure_ascii=False))
    return {"ok": True}


@app.post("/api/chat-state")
async def post_chat_state(request: Request, data: dict):
    return await put_chat_state(request, data)


# ══════════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════════
def _route_bias(route: str, text: str) -> str:
    if not route or route == "general":
        return text
    tags = {
        "risk":     "[โหมด: ประเมินความเสี่ยง/ผลกระทบ]",
        "survival": "[โหมด: ความอยู่รอดพื้นฐาน — อาหาร ที่พัก ความปลอดภัย]",
        "collapse": "[โหมด: ลูกโซ่ความเสียหาย/แรงกดดันสะสม]",
        "civil":    "[โหมด: งาน/พลเมือง/ความรับผิดชอบต่อส่วนรวม]",
        "vega":     "[โหมด: VEGA — strategic analysis ระยะยาว]",
    }
    return f"{tags.get(route, '')} {text}".strip()


def _resolve_voice_mode(data: dict, route: str) -> str:
    vm = str(data.get("voice_mode") or "").lower().strip()
    if vm == "crisis":                   return "crisis"
    if vm == "vega" or route == "vega":  return "vega"
    return "lyla"


def _paticcasamuppada_context(text: str) -> str:
    """ปฏิจสมุปบาท UDOK v2.0 — วิเคราะห์ลูกโซ่เหตุปัจจัย"""
    if analyze_chain:
        try:
            chain = analyze_chain({"input": text})
            if isinstance(chain, dict):
                root    = chain.get("root_cause", "")
                summary = chain.get("summary", "")
                nirvana = chain.get("nirvana_mode", False)
                uap     = chain.get("uap", {})
                parts = []
                if root:    parts.append(f"ต้นเหตุ: {root}")
                if nirvana: parts.append("chain ดับที่เวทนา — ระบบสงบ")
                elif summary: parts.append(summary)
                if uap.get("should_pause"):
                    parts.append("UAP: ควรหยุดก่อนตัดสินใจ")
                if parts:
                    return f"[ปฏิจสมุปบาท — {' | '.join(parts)}]"
        except Exception:
            pass
    return "[โยนิโสมนสิการ: วิเคราะห์ต้นเหตุและลูกโซ่ผลกระทบ]"


def _build_history_text(history: list) -> str:
    if not history:
        return ""
    lines = []
    for turn in history[-10:]:
        role    = turn.get("role", "user")
        content = str(turn.get("content", "")).strip()
        if not content:
            continue
        label = "ผู้ใช้" if role == "user" else "LYLA/VEGA"
        lines.append(f"{label}: {content}")
    if not lines:
        return ""
    return "=== บทสนทนาก่อนหน้า ===\n" + "\n".join(lines) + "\n=== สิ้นสุด ===\n\n"


# ══════════════════════════════════════════════════════════════════
# DECISION ENGINE — /run และ /decision
# ══════════════════════════════════════════════════════════════════
@app.post("/run")
@app.post("/decision")
async def run_kernel(request: Request, data: dict):
    user_input = data.get("input") or data.get("text") or ""
    if not user_input:
        return {"error": "Input is required"}

    email = unquote(request.cookies.get("kd_email") or "anonymous")
    route = data.get("route") or "general"
    vm    = _resolve_voice_mode(data, route)

    if record_question:
        record_question()

    # ── Human state ──────────────────────────────────────────────
    human_state = {"entropy": 40, "resource": 50, "stability": 60, "risk_score": 10}
    if analyze_human:
        try:
            human_state = analyze_human(data.get("context", {})) or human_state
        except Exception:
            pass

    # ── Intent ───────────────────────────────────────────────────
    intent = {"intent": "general", "confidence": 0.5}
    if analyze_intent:
        try:
            intent = analyze_intent(user_input) or intent
        except Exception:
            pass

    # ── Risk ─────────────────────────────────────────────────────
    risk_ctx = ""
    if assess_risk:
        try:
            r = assess_risk(human_state)
            if isinstance(r, dict) and r.get("level"):
                risk_ctx = f"[Risk: {r['level']}]"
                if r.get("level") in ("HIGH", "CRITICAL") and route not in ("vega",):
                    route = "collapse"
        except Exception:
            pass

    # ── Collapse prediction ──────────────────────────────────────
    collapse_ctx = ""
    if predict_collapse:
        try:
            risk_score = human_state.get("risk_score", human_state.get("entropy", 40))
            c = predict_collapse(risk_score)
            if isinstance(c, dict) and c.get("probability", 0) > 0.6:
                collapse_ctx = f"[Collapse probability: {c['probability']:.0%}]"
        except Exception:
            pass

    # ── ปฏิจสมุปบาท context ──────────────────────────────────────
    paticca_ctx = _paticcasamuppada_context(user_input)

    # ── Survivor engine ──────────────────────────────────────────
    survivor_ctx = ""
    if orchestrator:
        try:
            sr = orchestrator.run_with_survivor_engine(
                user_input=user_input,
                human_context=data.get("context", {})
            )
            survivor_ctx = sr.get("survivor_context", "")
            if not sr.get("can_decide", True) and route not in ("vega",):
                route = sr.get("route", route)
        except Exception:
            pass
    elif survivor_analyze:
        try:
            sr = survivor_analyze(user_input, data.get("context", {}))
            survivor_ctx = sr.get("context", "")
            if not sr.get("can_decide", True) and route not in ("vega",):
                route = sr.get("route", route)
        except Exception:
            pass

    # ── Build effective input ────────────────────────────────────
    routed       = _route_bias(route, user_input)
    history_text = _build_history_text(data.get("history") or [])

    extra_ctx_parts = [p for p in [paticca_ctx, risk_ctx, collapse_ctx] if p]
    extra_ctx = " ".join(extra_ctx_parts)

    effective_input = history_text
    if survivor_ctx:
        effective_input += survivor_ctx + "\n\n"
    effective_input += routed
    if extra_ctx:
        effective_input += f"\n\n{extra_ctx}"

    payload = {**data, "input": effective_input}

    # ── Run decision ─────────────────────────────────────────────
    if full_run_decision:
        result = full_run_decision(payload)
    elif engine:
        result = engine.run(payload)
    else:
        reply = "[KING DIADEM — Offline]\n— Fail Less. Harm Less. Restore Choice. —"
        if llm:
            try:
                reply = llm.generate_with_governance(
                    prompt=effective_input,
                    additional_context=(
                        f"entropy={human_state.get('entropy')}, "
                        f"stability={human_state.get('stability')}, "
                        f"voice_mode={vm}"
                    ),
                    history=data.get("history") or [],
                    route=route,
                    voice_mode=vm,
                )
            except Exception as e:
                reply = f"[Gemini Error: {e}]"

        result = {
            "observer":    "KING DIADEM",
            "status":      "SUCCESS",
            "route":       intent.get("intent", route) if isinstance(intent, dict) else route,
            "ai_response": reply,
            "governance":  {"intent": intent, "human_state": human_state},
            "persona":     "VEGA" if vm == "vega" else "LYLA",
        }

    result["route"]      = result.get("route") or route
    result["persona"]    = "VEGA" if vm == "vega" else "LYLA"
    result["voice_mode"] = vm

    # ── Consensus ────────────────────────────────────────────────
    if build_consensus and result.get("ai_response"):
        try:
            cs = build_consensus({
                "text":        user_input,
                "response":    result["ai_response"],
                "route":       route,
                "human_state": human_state,
            })
            if isinstance(cs, dict) and cs.get("consensus"):
                result["consensus"] = cs["consensus"]
        except Exception:
            pass

    # ── Logging ──────────────────────────────────────────────────
    if log_decision and result.get("ai_response"):
        try:
            log_decision(email, user_input, result.get("route", "general"),
                         str(result.get("ai_response", "")))
        except Exception:
            pass

    if record_learning and result.get("ai_response"):
        try:
            record_learning(
                question=user_input,
                decision=result.get("route", "general"),
                planet_context={
                    "entropy":   human_state.get("entropy"),
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
async def simulate_endpoint(data: dict):
    user_input = data.get("input", "")
    paths  = data.get("paths") or []
    route  = data.get("route") or "vega"
    vm     = _resolve_voice_mode(data, route)

    extra = ""
    if paths:
        extra = "\nทางเลือกที่ผู้ใช้ระบุ:\n" + "\n".join(f"- {p}" for p in paths if str(p).strip())

    sim_result = None
    if simulate:
        try:
            sim_result = simulate(user_input, paths or [])
        except Exception:
            pass

    if not llm:
        return {"status": "OFFLINE", "message": "LLM not found"}

    paticca = _paticcasamuppada_context(user_input)

    try:
        raw = llm.generate_with_governance(
            prompt=f"จำลองอนาคต 30/90/365 วัน:\n{user_input}{extra}\n\n{paticca}",
            additional_context="mode=simulation, วิเคราะห์ลูกโซ่เหตุปัจจัยและความเสี่ยง",
            route=route,
            voice_mode=vm,
        )
    except Exception as e:
        raw = f"Simulation error: {e}"

    observation = lyla.observe(user_input) if lyla else {"stability": "NOMINAL"}
    return {
        "status":           "SUCCESS",
        "simulation":       raw,
        "lyla_observation": observation,
        "engine_result":    sim_result,
        "persona":          "VEGA" if vm == "vega" else "LYLA",
    }


# ── IMAGE ANALYSIS ────────────────────────────────────────────────
@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    if not llm:
        return {"status": "OFFLINE", "message": "LLM not found"}
    try:
        from google import genai as g
        from google.genai import types as t
        content = await file.read()
        client  = g.Client(api_key=os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY2"))
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[t.Content(role="user", parts=[
                t.Part.from_bytes(data=content, mime_type=file.content_type or "image/jpeg"),
                t.Part.from_text(text=(
                    "วิเคราะห์ภาพนี้:\n"
                    "1. สิ่งที่เห็นคืออะไร\n"
                    "2. มีความเสี่ยงหรือ drift ที่ซ่อนอยู่ไหม\n"
                    "3. ทางเลือกที่แนะนำ ≤3 ทาง\n"
                    "ตอบตรงๆ ไม่ตัดสิน\n\nลงท้ายด้วย — LYLA ◈"
                )),
            ])],
        )
        return {"status": "SUCCESS", "analysis": response.text, "filename": file.filename, "persona": "LYLA"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/upload-image")
async def upload_image_alias(file: UploadFile = File(...)):
    return await analyze_image(file)


# ── PAYMENT ───────────────────────────────────────────────────────
@app.post("/payment/create-checkout")
async def create_checkout(request: Request):
    payload = await request.json()
    plan  = payload.get("plan", "basic")
    email = (
        payload.get("email")
        or payload.get("api_key")
        or unquote(request.cookies.get("kd_email") or "guest")
    )
    plans = {
        "basic":        {"amount": 29900, "currency": "thb", "name": "KING DIADEM Basic — ฿299/เดือน"},
        "civilization": {"amount": 99900, "currency": "thb", "name": "KING DIADEM Civilization — ฿999/เดือน"},
        "topup":        {"amount": 5000,  "currency": "thb", "name": "KING DIADEM Credits — ฿50"},
    }
    p = plans.get(plan, plans["basic"])
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{"price_data": {
                "currency": p["currency"],
                "product_data": {"name": p["name"]},
                "unit_amount": p["amount"],
            }, "quantity": 1}],
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
async def credits_check(request: Request):
    email = unquote(request.cookies.get("kd_email") or "anonymous")
    c = get_credits(email) if get_credits else 0
    return {"email": email, "credits": c}
