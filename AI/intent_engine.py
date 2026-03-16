def detect_intent(text):

    t=text.lower()

    if "ช่วย" in t or "ทางออก" in t:
        return "survivor"

    if "ทำยังไง" in t or "ควร" in t:
        return "seeker"

    if "วิเคราะห์" in t or "ระบบ" in t:
        return "strategist"

    if "สร้าง" in t or "ทำโปรเจกต์" in t:
        return "builder"

    return "explorer"
