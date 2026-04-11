from WORLD_MODEL.human_behavior import detect_emotion, extract_context
from WORLD_MODEL.survival_threshold import survival_priority
from WORLD_MODEL.environment import environment_state

def ENGINE_DECISION(text: str):

    emotion = detect_emotion(text)
    context = extract_context(text)

    # ===== PRIORITY =====
    survival = survival_priority(context)

    # ===== ENVIRONMENT =====
    pressure = environment_state["economic_pressure"]

    # ===== DECISION LOGIC =====
    if survival != "stable":
        return {
            "ENGINE": "SURVIVAL_MODE",
            "action": survival
        }

    if emotion == "stress":
        return {
            "ENGINE": "STABILIZE",
            "action": "reduce_risk"
        }

    if pressure > 0.6:
        return {
            "ENGINE": "ECONOMIC_DEFENSE",
            "action": "save_money"
        }

    return {
        "ENGINE": "NORMAL",
        "action": "proceed"
    }
