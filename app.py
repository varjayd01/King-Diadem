import os
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from ENGINE.pattern_engine import analyze_pattern
from ENGINE.risk_engine import analyze_risk
from ENGINE.decision_engine import decision_intelligence
from ENGINE.council_engine import council_engine
from ENGINE.consensus_engine import consensus_engine

from core.core_loop import run_core
from core.emptiness_guard import emptiness_guard

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")


@app.get("/")
def root():
    return FileResponse(os.path.join(BASE_DIR, "static/index.html"))


class InputData(BaseModel):
    entropy: float
    resource: float
    stability: float


@app.post("/ENGINE")
def run_engine(data: InputData):

    state = analyze_pattern(data.model_dump())
    state = emptiness_guard(state)

    core = run_core(state)

    if core["status"] == "HALT":
        return core

    risk = analyze_risk(core["state"])
    decision = decision_intelligence(core["state"], risk)
    council = council_engine(decision)
    final = consensus_engine(council)

    return {
        "core": core,
        "risk": risk,
        "decision": final
    }
