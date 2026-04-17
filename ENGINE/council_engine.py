# ENGINE/council_engine.py

MEMBERS = [
    ("Altair", "strategic reasoning"),
    ("Vega", "risk stability"),
    ("Lyla", "option preservation"),
    ("Titan", "structural reasoning"),
    ("DriftZero", "drift audit"),
    ("FATE", "decision integrity"),
    ("Pratiya", "cause-effect chain"),
]


def council_engine(decision, state=None):
    state = state or {}

    risk_score = float(state.get("risk_score", 0))
    stability = float(state.get("stability", 50))
    resource = float(state.get("resource", 50))
    action = decision.get("action", "maintain")

    votes = []
    for idx, (member, role) in enumerate(MEMBERS):
        weight = 100 - idx * 6

        if action == "stabilize":
            vote_action = "stabilize"
            vote_score = weight + (10 if risk_score >= 80 else 0)
        elif action == "recover_resource":
            vote_action = "recover_resource"
            vote_score = weight + (8 if resource < 30 else 0)
        elif action == "expand_choices":
            vote_action = "expand_choices"
            vote_score = weight + (6 if stability >= 40 else -5)
        else:
            vote_action = "maintain"
            vote_score = weight

        votes.append({
            "member": member,
            "role": role,
            "action": vote_action,
            "score": max(0, min(100, vote_score)),
        })

    average_score = round(sum(v["score"] for v in votes) / len(votes), 2) if votes else 0

    return {
        "decision": decision,
        "votes": votes,
        "score": average_score,
        "council_size": len(votes),
    }
