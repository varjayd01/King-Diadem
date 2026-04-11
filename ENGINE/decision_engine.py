def ENGINE_DECISION(text: str):

    text = text.lower()

    if "เงิน" in text or "money" in text:
        if "0" in text or "น้อย" in text:
            return "❌ ประหยัดทันที หยุดความเสี่ยง"
        else:
            return "💰 ใช้เงินแบบควบคุมความเสี่ยง"

    if "เสี่ยง" in text or "risk" in text:
        return "⚠️ ลด risk ก่อนตัดสินใจ"

    if "อาหาร" in text or "food" in text:
        return "🍜 หาอาหารก่อน ทุกอย่างค่อยคิดทีหลัง"

    return "🧠 วิเคราะห์เพิ่ม ยังไม่ชัด"
