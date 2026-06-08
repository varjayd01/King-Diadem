from core.time_engine import compute_time_to_failure, compute_decision_window
from ENGINE.emotion_state import EmotionState  # ← Import มหาแกนความจำอารมณ์ชิ้นใหม่
from AI.reality_learning import record_outcome  # ← Import ระบบปิดลูปเรียนรู้ความจริง

def clamp(v):
    return max(0, min(100, v))

def compute_drift(state):
    return clamp((state["entropy"] * 0.5) + ((100 - state["resource"]) * 0.5))

def update_entropy(state):
    state["entropy"] = clamp(state["entropy"] + state["drift"] * 0.1 - 1.5)
    return state

def update_stability(state):
    state["stability"] = clamp(state["stability"] - state["drift"] * 0.3 + 0.5)
    return state

def stop_the_line(state):
    return state["stability"] < 20 or state["resource"] < 10

def run_core(state, user_prompt=None, current_emotion=None):
    """
    KING DIADEM Core Loop v3.0 - ปิดลูปมหา Pipeline จับอารมณ์และเรียนรู้ความจริง
    """
    # 1. คำนวณค่าพลังงานดวงดาวเสถียรภาพคงเดิม
    state["drift"] = compute_drift(state)
    state = update_entropy(state)
    state = update_stability(state)
    
    # 2. ทำงานร่วมกับระบบความจำอารมณ์ข้ามเทิร์น (Emotion State Integration)
    if "emotion_session" not in state:
        state["emotion_session"] = EmotionState()
        
    if user_prompt and current_emotion:
        # อัปเดตและบันทึกแนวโน้มมวลอารมณ์ล่าสุด
        state["emotion_session"].update(current_emotion)
        state["emotion_ctx"] = state["emotion_session"].context_note()
        
        # ปิดลูปส่งสัญญาณย้อนกลับไปเรียนรู้ผลลัพธ์ลงคลังข้อความหลังบ้าน
        outcome_status = "positive" if state["stability"] >= 40 else "negative"
        record_outcome(user_prompt, state.get("last_decision", "general"), outcome_status)
    
    # 3. ตรวจสอบกลไกสับคัตเอาต์กู้ภัยชีวิตสูงสุด (Stop-the-line)
    if stop_the_line(state):
        return {"status": "HALT", "state": state}
        
    ttf = compute_time_to_failure(state)
    window = compute_decision_window(ttf)
    
    return {
        "status": "RUNNING",
        "state": state,
        "time_to_failure": ttf,
        "decision_window": window,
        "emotion_context": state.get("emotion_ctx", "EMOTION:NEUTRAL")
    }
