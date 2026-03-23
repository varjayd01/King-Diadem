def analyze_patterns(user_input: str):
    text = (user_input or "").lower()

    detected = {
        "pattern_detected": False,
        "pivot_ratio": 0.0,
        "defensive_ratio": 0.0
    }

    if any(k in text for k in ["เงิน", "ลงทุน", "ตลาด", "crypto", "หุ้น"]):
        detected["pattern_detected"] = True
        detected["pivot_ratio"] = 0.7

    if any(k in text for k in ["กลัว", "เสี่ยง", "ไม่มั่นใจ"]):
        detected["pattern_detected"] = True
        detected["defensive_ratio"] = 0.6

    return detected
