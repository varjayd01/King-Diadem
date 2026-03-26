import streamlit as st

# ------------------------
# CORE LOGIC (ของพี่)
# ------------------------
def evaluate_choice(choice):
    risk_keywords = ["หนี้", "เสี่ยง", "หมดตัว", "อันตราย", "ติด", "เสีย"]
    score = 0
    for word in risk_keywords:
        if word in choice:
            score += 1
    return score

def decision_engine(problem, choices):
    results = []
    
    for c in choices:
        risk = evaluate_choice(c)
        results.append((c, risk))
    
    best = sorted(results, key=lambda x: x[1])[0]

    return {
        "problem": problem,
        "best_choice": best[0],
        "reason": "เสี่ยงต่ำสุด และยังเหลือทางเลือกต่อ"
    }

# ------------------------
# UI (หน้าจอ)
# ------------------------
st.set_page_config(page_title="KING DIADEM", page_icon="👑")

st.title("👑 KING DIADEM - Decision Engine")
st.write("ระบบช่วยตัดสินใจแบบลดความเสี่ยง")

problem = st.text_input("ปัญหาของคุณคืออะไร?")

st.write("ใส่ตัวเลือกของคุณ:")
c1 = st.text_input("ตัวเลือก 1")
c2 = st.text_input("ตัวเลือก 2")
c3 = st.text_input("ตัวเลือก 3")

if st.button("วิเคราะห์"):
    choices = [c1, c2, c3]
    choices = [c for c in choices if c.strip() != ""]

    if len(choices) < 2:
        st.warning("กรุณาใส่อย่างน้อย 2 ตัวเลือก")
    else:
        result = decision_engine(problem, choices)
        st.success(f"✅ ทางที่แนะนำ: {result['best_choice']}")
        st.info(result["reason"])
