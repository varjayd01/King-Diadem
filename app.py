# ==========================================
# 👑 KING DIADEM — ULTIMATE app.py
# Full Stack: Gemini + Council + Stripe + Governance
# ==========================================

from fastapi import FastAPI, Request, Header
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import os
import json

# ── CORE & ENGINE INTEGRATION ────────────────────────────────────
try:
    from ENGINE.decision_engine import DecisionEngine
    from ENGINE.council_engine import council_engine
    from ENGINE.consensus_engine import consensus_engine
    from ENGINE.human_engine import analyze_human
    from AI.intent_engine import analyze_intent
    from AI.king_response import king_response
    from AI.freedom_signal import record_question, freedom_index
except Exception as e:
    print(f"⚠ ENGINE IMPORT ERROR: {e}")
    DecisionEngine = None
    council_engine = None
    consensus_engine = None
    analyze_human = None
    analyze_intent = None
    king_response = None
    record_question = None
    freedom_index = None

# ── LLM & KERNEL ────────────────────────────────────────────────
try:
    from core.llm_gemini import GeminiLLM
    from core.lyla_kernel import LylaKernel
    lyla = LylaKernel()
    llm = GeminiLLM(model="gemini-2.0-flash")
    print("✅ LYLA & Gemini Loaded")
except Exception as e:
    print(f"⚠ LLM/LYLA ERROR: {e}")
    llm = None
    lyla = None

# ── INIT APP ─────────────────────────────────────────────────────
app = FastAPI(title="KING DIADEM OS")
engine = DecisionEngine() if DecisionEngine else None

# ── STATIC & ROOT ───────────────────────────────────────────────
@app.get("/")
def root():
    return FileResponse("static/index.html")

app.mount("/static", StaticFiles(directory="static"), name="static")

# ── HEALTH CHECK ────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "alive 👑",
        "human_protocol": "ENFORCED",
        "freedom_score": freedom_index() if freedom_index else 0,
        "llm_loaded": llm is not None,
        "engine_loaded": engine is not None,
        "lyla_loaded": lyla is not None,
        "stripe_loaded": bool(os.getenv("STRIPE_SECRET_KEY")),
    }

# ── MAIN DECISION ENGINE ─────────────────────────────────────────
@app.post("/run")
@app.post("/decision")
async def run_kernel(data: dict):
    user_input = data.get("input") or data.get("text") or ""
    context = data.get("context", {"energy": 50, "money": 50, "stress": 50})

    if not user_input:
        return {"error": "Input is required"}

    if record_question:
        record_question()

    # Fallback ถ้า import ล้มเหลว
    human_state = analyze_human(context) if analyze_human else {"entropy": 40, "resource": 50, "stability": 60, "risk_score": 10}
    intent = analyze_intent(user_input) if analyze_intent else {"intent": "general", "confidence": 0.5}

    if engine:
        raw_result = engine.run(data)
    else:
        raw_result = {"action": "maintain", "message": "Standard fallback activated"}

    if council_engine and consensus_engine:
        council_votes = council_engine(raw_result, state=human_state)
        final_consensus = consensus_engine(council_votes, state=human_state)
    else:
        final_consensus = {"final_action": "maintain", "confidence": 50, "message": "Council offline"}

    if king_response:
        reply = king_response(user_input, json.dumps(final_consensus, ensure_ascii=False))
    else:
        reply = f"[KING DIADEM]\n\nInput: {user_input}\nAction: {final_consensus.get('final_action', 'maintain')}\n\n— Fail Less. Harm Less. Restore Choice. —"

    return {
        "observer": "KING DIADEM",
        "ai_response": reply,
        "route": intent.get("intent", "general") if isinstance(intent, dict) else "general",
        "governance": {
            "intent": intent,
            "consensus": final_consensus
        }
    }

# ── FUTURE SIMULATION ────────────────────────────────────────────
@app.post("/simulate")
async def simulate_future(data: dict):
    user_input = data.get("input", "")
    if not llm:
        return {"status": "OFFLINE", "message": "LLM not found"}

    simulation_prompt = f"สถานการณ์: {user_input}\nวิเคราะห์ 30/90/365 วัน ตามกฎ HUMAN_PROTOCOL..."

    raw = llm.generate_with_governance(simulation_prompt)

    observation = lyla.observe(user_input) if lyla else "Standard Observation"

    return {
        "status": "SUCCESS",
        "simulation": raw,
        "lyla_observation": observation
    }

# ── PAYMENT SYSTEM (Stripe) ──────────────────────────────────────
import stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@app.post("/payment/create-checkout")
async def create_checkout():
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{"price": os.getenv("STRIPE_PRICE_ID"), "quantity": 1}],
            mode="payment",
            success_url="https://king-diadem.onrender.com/success",
            cancel_url="https://king-diadem.onrender.com/cancel",
        )
        return {"url": session.url}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
