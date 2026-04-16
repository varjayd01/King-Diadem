from ENGINE.situation_analyzer import analyze_situation
from ENGINE.human_state_engine import analyze_human_state
from ENGINE.relationship_engine import analyze_relationship
from ENGINE.collapse_predictor import predict_collapse
from ENGINE.path_generator import generate_paths
from ENGINE.intervention_engine import intervention
from ENGINE.decision_engine import run_decision

from core.emptiness_guard import emptiness_guard


def king_diadem(question: str):

    situation = analyze_situation(question)
    human_state = analyze_human_state(question)

    # 🔥 ไม่ยึด
    human_state = emptiness_guard(human_state)

    relationship_state = analyze_relationship(human_state)
    collapse_risk = predict_collapse(human_state)

    paths = generate_paths(human_state)
    help_plan = intervention(paths)

    decision = run_decision({
        "location": situation.get("location", "unknown"),
        "food": situation.get("food", "medium"),
        "money": situation.get("money", 0),
        "risk": situation.get("risk", "medium")
    })

    return {
        "situation": situation,
        "human_state": human_state,
        "relationship": relationship_state,
        "risk": collapse_risk,
        "paths": paths,
        "decision": decision
    }
