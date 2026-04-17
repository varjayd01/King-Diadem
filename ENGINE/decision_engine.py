# ENGINE/decision_engine.py

def decision_intelligence(state, risk):
    risk_score = float(risk.get("risk_score", 0))
    stability = float(state.get("stability", 50))
    resource = float(state.get("resource", 50))
    choices = int(state.get("choices", 1) or 1)

    alternatives = [
        {"action": "stabilize", "message": "ลดความเสี่ยงทันที"},
        {"action": "recover_resource", "message": "เพิ่มทรัพยากร"},
        {"action": "maintain", "message": "รักษาสถานะ"},
        {"action": "expand_choices", "message": "ขยายทางเลือกอย่างปลอดภัย"},
    ]

    if risk_score >= 85 or stability < 20:
        decision = {
            "action": "stabilize",
            "message": "ลดความเสี่ยงทันที",
            "priority": "SURVIVAL",
            "confidence": 0.92,
            "alternatives": alternatives,
        }
    elif resource < 25:
        decision = {
            "action": "recover_resource",
            "message": "เพิ่มทรัพยากรก่อน",
            "priority": "RESOURCE",
            "confidence": 0.78,
            "alternatives": alternatives,
        }
    elif choices <= 1:
        decision = {
            "action": "maintain",
            "message": "คงระบบและรักษาทางเลือก",
            "priority": "STABILITY",
            "confidence": 0.68,
            "alternatives": alternatives,
        }
    else:
        decision = {
            "action": "expand_choices",
            "message": "เพิ่มทางเลือกที่ปลอดภัย",
            "priority": "GROWTH",
            "confidence": 0.72,
            "alternatives": alternatives,
        }

    decision["confidence"] = round(min(1.0, max(0.0, decision["confidence"])), 2)
    return decision
