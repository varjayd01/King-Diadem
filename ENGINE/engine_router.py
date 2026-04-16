from fastapi import APIRouter
from pydantic import BaseModel

from AUTH.auth_system import authorize
from KING_DIAdem_core import king_diadem

router = APIRouter()

class EngineInput(BaseModel):
    username: str
    question: str
    location: str = ""
    food: str = ""
    money: str = ""
    risk: str = ""


@router.post("/ENGINE")
def run_engine(data: EngineInput):

    # 🔐 1. CHECK CREDIT
    auth = authorize(data.username)

    if auth["status"] != "allowed":
        return {
            "status": "blocked",
            "reason": "no credits"
        }

    # 🧠 2. RUN CORE
    result = king_diadem(data.question)

    return {
        "status": "ok",
        "decision": result["decision"],
        "paths": result["paths"],
        "risk": result["risk"]
    }
