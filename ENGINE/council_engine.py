# ENGINE/council_engine.py
# KING DIADEM — Council Engine
# สภาที่ปรึกษา: โหวตตัดสินใจร่วมกัน
# แก้: Altair → Choice (ตามสถาปัตยกรรมจริง)

MEMBERS = [
    ("Choice",    "option preservation & expansion"),   # แทน Altair — ปกป้องทางเลือก
    ("Vega",      "risk stability"),
    ("Lyla",      "human welfare & harm reduction"),
    ("Titan",     "structural reasoning"),
    ("DriftZero", "drift audit"),
    ("FATE",      "decision integrity"),
    ("Pratiya",   "cause-effect chain"),
]


def council_engine(decision: dict, state: dict = None) -> dict:
    """
    รับ: decision = { action, message }
         state    = { risk_score, stability, resource }
    คืน: { decision, votes, score, council_size }
    """
    state      = state or {}
    risk_score = _safe_float(state.get("risk_score", 0))
    stability  = _safe_float(state.get("stability", 50))
    resource   = _safe_float(state.get("resource", 50))
    action     = decision.get("action", "maintain")

    votes = []
    for idx, (member, role) in enumerate(MEMBERS):
        weight = 100 - idx * 6   # Choice=100, Vega=94, ... Pratiya=64

        if action == "stabilize":
            vote_action = "stabilize"
            # Choice ให้น้ำหนักสูงถ้า risk สูง — อย่าสูญเสียทางเลือก
            bonus = 12 if member == "Choice" and risk_score >= 70 else \
                    10 if risk_score >= 80 else 0
            vote_score = weight + bonus

        elif action == "recover_resource":
            vote_action = "recover_resource"
            bonus = 8 if resource < 30 else 0
            vote_score = weight + bonus

        elif action == "expand_choices":
            vote_action = "expand_choices"
            # Choice สนับสนุนการขยายทางเลือกเสมอถ้า stability พอ
            bonus = 10 if member == "Choice" and stability >= 35 else \
                    6  if stability >= 40 else -5
            vote_score = weight + bonus

        else:
            vote_action = "maintain"
            vote_score  = weight

        votes.append({
            "member":     member,
            "role":       role,
            "action":     vote_action,
            "score":      max(0, min(100, vote_score)),
        })

    average_score = round(sum(v["score"] for v in votes) / len(votes), 2) if votes else 0

    return {
        "decision":     decision,
        "votes":        votes,
        "score":        average_score,
        "council_size": len(votes),
    }


def _safe_float(val, default=0.0) -> float:
    try:
        return float(val)
    except (TypeError, ValueError):
        return default
