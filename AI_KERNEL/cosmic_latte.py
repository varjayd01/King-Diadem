# AI_KERNEL/cosmic_latte.py — สุญยตา context
def get_context(text: str) -> str:
    """คืน context สุญยตาถ้าพบ pattern ที่เกี่ยวข้อง"""
    t = str(text).lower()
    if any(w in t for w in ["ยึด","ปล่อยไม่ได้","ติด","เกาะ","cling"]):
        return "สุญยตา: ไม่มีสิ่งใดถาวร — บางครั้งปล่อยวางได้คือการเริ่มต้นได้"
    if any(w in t for w in ["กลัว","ไม่แน่","uncertain","fear"]):
        return "สุญยตา: ความไม่แน่นอนคือธรรมชาติ ไม่ใช่ศัตรู"
    return ""
