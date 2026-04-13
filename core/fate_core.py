# ===== FATE CORE =====
# Deterministic + Human-Aware (Non-emotional, Non-manipulative)

SYSTEM_MODE = "DETERMINISTIC_LOGIC_ONLY"


def run_fate(input_data):

    # ===== INPUT CHECK =====
    if not input_data or not isinstance(input_data, dict):
        return reject("INVALID_INPUT")

    if "message" not in input_data:
        return reject("MISSING_MESSAGE")

    if not isinstance(input_data["message"], str):
        return reject("INVALID_TYPE")

    message = input_data["message"].strip()

    if message == "":
        return reject("EMPTY_INPUT")

    # ===== NORMALIZE =====
    normalized = {
        "message": message
    }

    # ===== HUMAN RISK SIGNAL =====
    risk = detect_human_risk(message)

    # ===== TRACE =====
    trace = {
        "rules": [
            "INPUT_VALIDATION",
            "NORMALIZATION",
            "RISK_SCAN"
        ],
        "risk_level": risk
    }

    # ===== BLOCK EXTREME CASE =====
    if risk == "critical":
        return {
            "status": "block",
            "reason": "HIGH_RISK",
            "safe_response": safe_response(),
            "trace": trace
        }

    return {
        "status": "pass",
        "data": normalized,
        "risk": risk,
        "trace": trace
    }


# ===== HUMAN RISK DETECTION =====
def detect_human_risk(text):

    danger_words = ["ฆ่า", "ตาย", "ไม่อยากอยู่", "พังหมด", "จบแล้ว"]

    for w in danger_words:
        if w in text:
            return "critical"

    if len(text) < 3:
        return "low"

    return "normal"


# ===== SAFE RESPONSE =====
def safe_response():
    return (
        "สถานการณ์นี้มีความเสี่ยงสูงต่อผู้ใช้\n"
        "แนะนำให้หยุดก่อน และหาคนที่ไว้ใจได้คุยด้วยทันที"
    )


# ===== REJECT =====
def reject(reason):
    return {
        "status": "reject",
        "reason": reason
    }
