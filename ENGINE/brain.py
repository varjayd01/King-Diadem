from __future__ import annotations

from .decision import build_reply
from .intent import detect_intent
from .memory import append_turn, get_state, snapshot
from .risk import evaluate_risk


def think(message: str, mode: str = "chat", session_id: str = "default", seed: str = "") -> dict:
    session_id = (session_id or "default").strip() or "default"
    mode = (mode or "chat").strip() or "chat"
    seed = (seed or "").strip()

    state = get_state(session_id)
    state.mode = mode
    if seed:
        state.seed = seed

    msg = (message or "").strip()

    if not msg:
        reply = {
            "reply": "พิมพ์ข้อความมาได้เลย",
            "actions": ["ใส่ข้อความ", "กดส่ง", "หรือกด + เพื่อเปิด context"],
            "context": snapshot(session_id),
            "intent": "empty",
            "risk": {"score": 0, "level": "low", "pause": False},
            "mode": mode,
        }
        return {
            **reply,
            "seed": state.seed,
            "session_id": session_id,
            "history": snapshot(session_id),
        }

    append_turn(session_id, "user", msg)

    intent = detect_intent(msg)
    risk = evaluate_risk(msg)
    reply_pack = build_reply(
        message=msg,
        intent=intent,
        risk=risk,
        history=snapshot(session_id),
        seed=state.seed,
        mode=mode,
    )

    append_turn(session_id, "assistant", reply_pack["reply"])

    return {
        "reply": reply_pack["reply"],
        "actions": reply_pack["actions"],
        "context": reply_pack["context"],
        "intent": reply_pack["intent"],
        "risk": reply_pack["risk"],
        "mode": reply_pack["mode"],
        "seed": state.seed,
        "session_id": session_id,
        "history": snapshot(session_id),
    }
