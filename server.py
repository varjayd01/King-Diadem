import os
import uvicorn

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles


# AI
from AI.decision_engine import process_decision
from AI.freedom_signal import freedom_index
from AI.decision_memory import get_recent
from AI.civilization_engine import get_nodes as civilization_nodes
from AI.civilization_learning import get_learning
from AI.choice_points import add_points, get_points
from AI.reality_feedback import record_feedback, feedback_stats
from AI.planetary_reality import planetary_status


# NETWORK
from NETWORK.global_chat import add_chat, get_chat
from NETWORK.planetary_node import start_node, node_heartbeat
from NETWORK.node_registry import get_nodes as registry_nodes
from NETWORK.node_sync import network_status


app = FastAPI(title="KING DIADEM")

app.mount("/static", StaticFiles(directory="static"), name="static")


# -------------------
# HOME
# -------------------

@app.get("/", response_class=HTMLResponse)
async def root():

    with open("static/index.html", "r", encoding="utf-8") as f:

        return f.read()


# -------------------
# ASK AI
# -------------------

@app.post("/ask")
async def ask(request: Request):

    data = await request.json()

    question = data.get("question", "")

    result = process_decision(question)

    return JSONResponse({

        "question": question,
        "options": result["options"],
        "consensus": result["consensus"],
        "planetary": result["planetary_context"],
        "council": result["council"],
        "node_votes": result["node_votes"]

    })


# -------------------
# PLANET STATUS
# -------------------

@app.get("/planet")
def planet():

    return planetary_status()


# -------------------
# FREEDOM SIGNAL
# -------------------

@app.get("/freedom")
def freedom():

    score = freedom_index()

    status = "stable"

    if score < 30:
        status = "compression"

    if score > 60:
        status = "expansion"

    return {

        "freedom_index": score,
        "status": status

    }


# -------------------
# DECISION MEMORY
# -------------------

@app.get("/memory")
def memory():

    return {

        "recent_decisions": get_recent()

    }


# -------------------
# CIVILIZATION ENGINE
# -------------------

@app.get("/civilization")
def civilization():

    return {

        "nodes": civilization_nodes()

    }


# -------------------
# CIVILIZATION LEARNING
# -------------------

@app.get("/civilization/learning")
def learning():

    return {

        "learning_memory": get_learning()

    }


# -------------------
# REALITY FEEDBACK
# -------------------

@app.post("/feedback")
async def feedback(request: Request):

    data = await request.json()

    problem = data.get("problem")

    option = data.get("option")

    success = data.get("success", False)

    record_feedback(problem, option, success)

    return {"status": "recorded"}


@app.get("/feedback/stats")
def feedback_statistics():

    return feedback_stats()


# -------------------
# CHOICE POINTS
# -------------------

@app.post("/points/add")
async def add_user_points(request: Request):

    data = await request.json()

    user = data.get("user", "anonymous")

    amount = data.get("points", 1)

    score = add_points(user, amount)

    return {"points": score}


@app.get("/points/{user}")
def user_points(user: str):

    return {

        "user": user,
        "points": get_points(user)

    }


# -------------------
# GLOBAL CHAT
# -------------------

@app.post("/world/chat")
async def world_chat(request: Request):

    data = await request.json()

    user = data.get("user", "anonymous")

    message = data.get("message", "")

    add_chat(user, message)

    return {"status": "ok"}


@app.get("/world/messages")
def messages():

    return {

        "messages": get_chat()

    }


# -------------------
# PLANETARY NODE NETWORK
# -------------------

@app.get("/network/start")
def start_network_node():

    return start_node()


@app.get("/network/heartbeat")
def heartbeat():

    node_heartbeat()

    return {"status": "alive"}


@app.get("/network/nodes")
def nodes():

    return {

        "nodes": registry_nodes()

    }


@app.get("/network/status")
def network():

    return network_status()


# -------------------
# SYSTEM HEALTH
# -------------------

@app.get("/system/health")
def health():

    return {

        "system": "KING DIADEM",
        "status": "online"

    }


# -------------------
# RUN SERVER
# -------------------

if __name__ == "__main__":

    port = int(os.environ.get("PORT", 10000))

    uvicorn.run(app, host="0.0.0.0", port=port)
