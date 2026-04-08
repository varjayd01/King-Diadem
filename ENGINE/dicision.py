def think(text: str):
    text = text.strip()

    if not text:
        return "..."

    # core logic (แกนพี่)
    if "หิว" in text:
        return "ไปหาอะไรกินก่อน ระบบยังอยู่"

    if "เหนื่อย" in text:
        return "พักก่อน แล้วค่อยเดินต่อ"

    # fallback
    return f"รับแล้ว: {text}"
