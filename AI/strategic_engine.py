# AI/strategic_engine.py — KING DIADEM
# กฎ: Preserve life. Avoid harm. Seek cooperation before conflict.

SAFETY_RULE = """
All strategies must preserve life and avoid harm.
Forbidden: Violence, War, Harm to people, Harm to animals,
           Destruction of property, Environmental damage
Preferred:  Cooperation, Stability, Survival, Restoration
"""

def strategic_analysis(location: str, food: float, money: float, danger: float) -> dict:
    risk = (danger * 2) - food
    options = []

    if food <= 1:
        options.append("หาอาหารจากแหล่งที่ปลอดภัยและถูกกฎหมาย เช่น ตลาดท้องถิ่นหรือชุมชน")
    if money <= 100:
        options.append("มองหางานระยะสั้นหรือความร่วมมือในชุมชน")
    if danger >= 7:
        options.append("ลดการเผชิญอันตราย ย้ายไปสภาพแวดล้อมที่ปลอดภัยกว่า")
    if risk < 5:
        options.append("ขยายโอกาสอย่างระมัดระวัง รักษาความปลอดภัยไว้ก่อน")

    options.append("หาความร่วมมือกับคนท้องถิ่นก่อนที่จะเพิ่มความขัดแย้ง")
    options.append("ให้ความสำคัญกับทางออกที่ปกป้องคน สัตว์ ทรัพย์สิน และสิ่งแวดล้อม")

    if not options:
        options.append("รักษาเสถียรภาพ สังเกตสถานการณ์ และหลีกเลี่ยงความเสี่ยงที่ไม่จำเป็น")

    return {
        "risk_score":          round(risk, 2),
        "location":            location,
        "recommended_actions": options,
        "principle":           "Survival without harm",
        "safety_rule":         "Preserve life. Avoid harm. Cooperation first.",
    }
