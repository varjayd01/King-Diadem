# core/brain.py

def run_brain(message: str):
    if not message or message.strip() == "":
        return {
            "text": "ไม่มีข้อมูลให้วิเคราะห์",
            "risk": 0,
            "choices": []
        }

    if "เสี่ยง" in message:
        return {
            "text": "ตรวจพบความเสี่ยง",
            "risk": 0.8,
            "choices": [
                "หยุดก่อน",
                "ลดความเสี่ยง",
                "หาทางเลือกใหม่"
            ]
        }

    if "เงิน" in message:
        return {
            "text": "เกี่ยวข้องกับทรัพยากร",
            "risk": 0.5,
            "choices": [
                "เก็บเงิน",
                "ลงทุนแบบระวัง",
                "ลดรายจ่าย"
            ]
        }

    return {
        "text": f"วิเคราะห์: {message}",
        "risk": 0.2,
        "choices": [
            "ทางเลือก A",
            "ทางเลือก B",
            "ทางเลือก C"
        ]
    }
