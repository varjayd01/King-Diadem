from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import os
import stripe

app = FastAPI()

# =========================
# 🔥 STATIC
# =========================
@app.get("/")
def root():
    return FileResponse("static/index.html")

app.mount("/static", StaticFiles(directory="static"), name="static")

# =========================
# 🧾 FAKE DB
# =========================
USERS = {}

# =========================
# 🔐 REGISTER
# =========================
@app.post("/register")
async def register(data: dict):
    email = data.get("email")
    password = data.get("password")

    if email in USERS:
        return {"error": "user exists"}

    USERS[email] = {
        "password": password,
        "credit": 0
    }

    return {"status": "registered"}

# =========================
# 🔐 LOGIN
# =========================
@app.post("/login")
async def login(data: dict):
    email = data.get("email")
    password = data.get("password")

    user = USERS.get(email)

    if not user or user["password"] != password:
        return {"error": "invalid"}

    return {
        "status": "ok",
        "credit": user["credit"]
    }

# =========================
# 💰 WALLET TOPUP (DEMO)
# =========================
@app.post("/wallet/topup")
async def topup(data: dict):

    email = data.get("email")
    amount = int(data.get("amount", 0))

    if email not in USERS:
        return {"error": "user not found"}

    credit = amount * 10
    USERS[email]["credit"] += credit

    return {
        "status": "topup success",
        "credit_added": credit,
        "total_credit": USERS[email]["credit"]
    }

# =========================
# ⚡ USE CREDIT
# =========================
def use_credit(email, cost=1):
    if email not in USERS:
        return False
    if USERS[email]["credit"] < cost:
        return False

    USERS[email]["credit"] -= cost
    return True

# =========================
# 🧠 ENGINE
# =========================
try:
    from ENGINE.decision_engine import DecisionEngine
    engine = DecisionEngine()
except:
    engine = None

@app.post("/run")
async def run_engine(data: dict):
    if engine:
        return engine.run(data)
    return {"error": "ENGINE NOT FOUND"}

# =========================
# 🤖 AI (ใช้เครดิต)
# =========================
@app.post("/ai")
async def ai_call(data: dict):

    email = data.get("email", "guest")

    if not use_credit(email, 1):
        return {"ai": "❌ เครดิตหมด"}

    try:
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        decision = engine.run(data) if engine else {}

        prompt = f"""
SYSTEM:
{decision}

USER:
{data.get("input")}
"""

        res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )

        return {
            "ai": res.choices[0].message.content,
            "credit_left": USERS[email]["credit"]
        }

    except Exception as e:
        return {"ai": f"[AI ERROR] {str(e)}"}

# =========================
# 💳 STRIPE
# =========================
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@app.post("/create-checkout-session")
def create_checkout():
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price": os.getenv("STRIPE_PRICE_ID"),
                "quantity": 1,
            }],
            mode="payment",
            success_url="https://king-diadem.onrender.com/",
            cancel_url="https://king-diadem.onrender.com/",
        )
        return {"url": session.url}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# =========================
# ❤️ HEALTH
# =========================
@app.get("/health")
def health():
    return {"status": "alive 👑"}
