from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from app import decision_engine, analyze_system

import json
import os

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

user_profile = {}
group_chat = []

# 🧠 AI Chat
@app.post("/ask")
async def ask(req: Request):
    data = await req.json()
    q = data.get("question", "")

    ans = decision_engine(q, user_profile)

    # log
    if not os.path.exists("data"):
        os.makedirs("data")

    log_path = "data/decision_log.json"

    if not os.path.exists(log_path):
        with open(log_path, "w") as f:
            json.dump([], f)

    with open(log_path, "r") as f:
        logs = json.load(f)

    logs.append({"q": q, "a": ans})

    with open(log_path, "w") as f:
        json.dump(logs, f)

    return JSONResponse({"answer": ans})

# 💾 Save Persona
@app.post("/save_profile")
async def save(req: Request):
    data = await req.json()
    user_profile.update(data)
    return {"status": "saved"}

# 📊 Dashboard
@app.get("/dashboard")
async def dashboard():
    try:
        with open("data/decision_log.json") as f:
            logs = json.load(f)
    except:
        logs = []

    insight = analyze_system(logs)

    return {
        "total": len(logs),
        "logs": logs[-10:],
        "insight": insight
    }

# 🌍 Group Chat
@app.post("/group_send")
async def group_send(req: Request):
    data = await req.json()
    msg = data.get("msg")

    group_chat.append(msg)

    return {"status": "ok"}

@app.get("/group_get")
async def group_get():
    return {"messages": group_chat[-20:]}

# 🏠 Home
@app.get("/")
async def root():
    with open("static/index.html", encoding="utf-8") as f:
        return HTMLResponse(f.read())
