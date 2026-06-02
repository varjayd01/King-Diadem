# AI/intent_engine.py — KING DIADEM
# โยนิโสมนสิการ: อ่านเจตนาจากเหตุปัจจัย ไม่ใช่ keyword matching ล้วนๆ
# วิเคราะห์ 3 ชั้น: surface signal → context weight → causal intent

import re

# ── Intent definitions พร้อม causal weight ───────────────
_INTENTS = [
    {
        "name": "crisis",
        "weight": 3.0,   # override ทุกอย่าง
        "patterns": [
            "อยากตาย", "ไม่อยากอยู่", "ฆ่าตัว", "ฆ่าตัวเอง",
            "จบชีวิต", "หมดแล้วจริงๆ", "ทนไม่ไหวแล้ว", "ไม่มีทางออกเลย",
            r"\bsuicid", r"\bwant to die\b", r"\bend it all\b",
        ],
    },
    {
        "name": "survival",
        "weight": 2.0,
        "patterns": [
            "ตกงาน", "ไม่มีเงิน", "หนี้ท่วม", "กินไม่ได้", "ไล่ออก",
            "ไม่มีที่อยู่", "พังหมดเลย", "หมดทรัพยากร", "เอาตัวรอดไม่ได้",
            r"\bno money\b", r"\bbankrupt\b", r"\bevicted\b",
        ],
    },
    {
        "name": "risk",
        "weight": 1.8,
        "patterns": [
            "เสี่ยงมาก", "อันตราย", "ล้มละลาย", "ขาดทุนหนัก",
            "ระบบพัง", "collapse", "วิกฤต", "ทุกอย่างพัง",
        ],
    },
    {
        "name": "vega",
        "weight": 1.5,
        "patterns": [
            "ระยะยาว", "ภาพใหญ่", "กลยุทธ์", "strategic",
            "วิเคราะห์ระบบ", "5 ปีข้างหน้า", "ภาพรวม", "อนาคตของ",
        ],
    },
    {
        "name": "civil",
        "weight": 1.2,
        "patterns": [
            "ธุรกิจ", "บริษัท", "ลูกค้า", "โปรเจกต์", "เจ้านาย",
            "ลาออก", "startup", r"\bmarket\b", r"\brevenue\b",
        ],
    },
    {
        "name": "relationship",
        "weight": 1.1,
        "patterns": [
            "แฟน", "เลิกกัน", "ทะเลาะ", "ครอบครัว",
            "พ่อแม่", "ความสัมพันธ์", r"\brelationship\b",
        ],
    },
    {
        "name": "question",
        "weight": 0.8,
        "patterns": [
            "ควรทำยังไง", "ทำไงดี", "แนะนำได้ไหม",
            "คิดว่าอะไรดีกว่า", "ช่วยแนะนำ", "what should",
        ],
    },
]

def analyze_intent(text: str) -> dict:
    """
    โยนิโสมนสิการ: วิเคราะห์เจตนาจากหลายชั้น
    คืน { intent, confidence, signals, root_signal }
    """
    if not text:
        return {"intent": "general", "confidence": 0.3, "signals": [], "root_signal": None}

    t = text.lower().strip()
    scores = {}
    matched_signals = []

    for item in _INTENTS:
        name    = item["name"]
        weight  = item["weight"]
        hits    = 0
        matched = []
        for pat in item["patterns"]:
            if re.search(pat, t):
                hits += 1
                matched.append(pat if not pat.startswith(r'\b') else pat.replace(r'\b', ''))
        if hits:
            scores[name] = hits * weight
            matched_signals.extend([(name, m) for m in matched])

    if not scores:
        # Causal fallback: อ่าน emotional tone แทน keyword
        if any(w in t for w in ["เหนื่อย","ท้อ","เครียด","กลัว","เสียใจ","หมดหวัง"]):
            return {"intent": "vega", "confidence": 0.55,
                    "signals": ["emotional_tone"], "root_signal": "emotion"}
        if len(t) < 15:  # ข้อความสั้นมาก — ไม่พอวิเคราะห์
            return {"intent": "general", "confidence": 0.3,
                    "signals": [], "root_signal": None}
        return {"intent": "general", "confidence": 0.4,
                "signals": [], "root_signal": None}

    # intent ที่ score สูงสุด
    best       = max(scores, key=scores.get)
    best_score = scores[best]
    total      = sum(scores.values()) or 1
    confidence = round(min(0.95, best_score / total * (1 + best_score * 0.1)), 3)

    root = matched_signals[0][1] if matched_signals else None

    return {
        "intent":       best,
        "confidence":   confidence,
        "signals":      list({m[0] for m in matched_signals}),
        "root_signal":  root,
        "all_scores":   {k: round(v, 2) for k, v in sorted(scores.items(), key=lambda x: -x[1])},
    }
