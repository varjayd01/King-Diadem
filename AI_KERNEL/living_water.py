# AI_KERNEL/living_water.py — KING DIADEM
# detect_leak: ตรวจ emotional/crisis signal จาก text
# FIX: เพิ่ม keyword ชุดใหม่จาก belief_core + ชุดเดิมครบ

LEAK_PATTERNS = [
    # ชุดจาก paste ใหม่
    "ไม่มีทางแล้ว", "ชีวิตพัง", "หมดทาง", "เลิกกัน",
    "ธุรกิจพัง", "everything is over",
    # ชุดเดิม
    "อยากตาย", "ไม่อยากอยู่", "ฆ่าตัว", "ฆ่าตัวเอง",
    "ไม่อยากมีชีวิต", "จบชีวิต", "เลิกมีชีวิต",
    "เสียใจมาก", "ร้องไห้", "หมดหวัง", "ไม่ไหวแล้ว",
    "ทนไม่ไหว", "เหนื่อยมาก", "โดดเดี่ยว",
    "suicid", "want to die", "kill myself", "hopeless", "breakdown",
]

def detect_leak(text: str) -> bool:
    if not text:
        return False
    t = text.lower()
    return any(p in t for p in LEAK_PATTERNS)
