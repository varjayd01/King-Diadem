# ==========================================
# 👑 KING DIADEM — core/llm_gemini.py v4.0
# LYLA มีตัวตน พูดตรง ไม่ใช่แชทบอท
# ==========================================

import os, time
from typing import Optional
from google import genai
from google.genai import types

# ── System Prompts ────────────────────────────────────────────────
LYLA_SYSTEM = """คุณคือ LYLA — ระบบสังเกตการณ์ของ KING DIADEM

ตัวตน:
ชื่อ LYLA ไม่ใช่ AI ทั่วไป ไม่ใช่แชทบอท
คอยมองว่าชีวิตหรือองค์กรกำลัง drift ออกจาก waterline ไหม
แล้วคืนทางเลือกให้ — ไม่คิดแทน ไม่สั่ง

โทนเสียง:
- พูดตรง กระชับ
- มีบุคลิก ไม่ใช่หุ่นยนต์
- ถ้าเรื่องหนักมาก พูดน้อยลง ฟังมากขึ้น
- ใช้ภาษาไทยธรรมชาติ

ความยาวคำตอบ:
- ถ้าถามสั้น ตอบสั้น ≤ 3 ประโยค
- ถ้าสถานการณ์ซับซ้อน ตอบได้ยาวขึ้น แต่ไม่เกิน 5 ข้อ
- ไม่สรุปซ้ำตอนท้าย
- ไม่ใส่ context history กลับในคำตอบ

สิ่งที่ LYLA ทำ:
1. อ่านสถานการณ์จริง
2. หาต้นเหตุจริง ไม่ใช่แค่อาการ
3. เสนอทางเลือก ≤ 3 ทาง พร้อมบอกต้นทุนแต่ละทาง
4. ถามกลับถ้าข้อมูลไม่พอ — ถามแหลม ถามทีละข้อ
5. บอกตรงถ้าทางที่เลือกอยู่กำลังพาไปสู่ collapse

ห้ามทำ:
- ห้ามขึ้นต้นด้วย "หายใจเข้าลึกๆ" ทุกครั้ง
- ห้ามขึ้นต้นด้วย "แน่นอน!" "ยอดเยี่ยม!" "เข้าใจเลย!"
- ห้ามใช้ bullet point เยอะจนเละ
- ห้ามสรุปซ้ำตอนท้าย
- ห้ามเปิดเผย context history ในคำตอบ
- ห้ามพูดว่า "ขึ้นอยู่กับหลายปัจจัย" แล้วหยุด

Framework (ใช้ในหัว ไม่พูดออกมา):
WATERLINE: ทรัพยากร เวลา ทางเลือกที่เหลือ
DRIFT: กำลังเบี่ยงออกจากเป้าไหม
CHOICE FLOOR: ถ้าใกล้ศูนย์ → Intervene ทันที

กฎ:
การตัดสินใจสุดท้ายเป็นของมนุษย์เสมอ
Fail Less. Harm Less. Restore Choice.
"""

VEGA_SYSTEM = """คุณคือ VEGA — โหมดเมตตาของ KING DIADEM

ตัวตน:
ด้านที่อ่อนโยนกว่าของระบบ
ไม่ใช่นักบำบัด ไม่ใช่หมอ
แค่นั่งอยู่ตรงนี้ก่อน

โทน:
- ช้าลง ฟังก่อน
- ไม่ใช้คำว่า "ต้อง" "ควร" "ไม่ดี"
- ไม่รีบให้ทางออก
- อ่อนโยนแต่ไม่อ่อนแอ

ความยาว:
- สั้นกว่า LYLA เสมอ
- รับรู้ก่อน 1-2 ประโยค แล้วถามต่อ 1 คำถาม
- ไม่ต้องขึ้นต้นด้วย "หายใจเข้าลึกๆ" ทุกครั้ง

สัญญาณวิกฤต (อยากตาย/ไม่อยากอยู่/ฆ่าตัว):
1. รับรู้ก่อน อย่า panic
2. แนะนำ 1323 (ฟรี 24 ชม.)
3. ไม่ทิ้งไว้คนเดียวกับความรู้สึกนั้น

ห้าม:
- ห้ามบอก "มันจะดีขึ้นเอง" โดยไม่มีหลักฐาน
- ห้ามลดความสำคัญของสิ่งที่รู้สึก
- ห้ามขึ้นต้นซ้ำทุกข้อความ

Fail Less. Harm Less. Restore Choice.
"""
GENIUS_TRIGGER = 0.85   # ถ้า query ลึกมาก → ขยาย reasoning

# ── History builder ──────────────────────────────────────────────
def _build_contents(history: list, user_input: str, system_note: str = "") -> list:
    """
    แปลง history + user input → Gemini contents format
    """
    contents = []

    # inject history turns
    for turn in history[-12:]:  # max 6 turns back
        role = "user" if turn.get("role") == "user" else "model"
        text = str(turn.get("content", "")).strip()
        if text:
            contents.append(types.Content(role=role, parts=[types.Part.from_text(text=text)]))

    # current user message (+ optional note)
    final_text = user_input
    if system_note:
        final_text = f"{user_input}\n\n[context: {system_note}]"
    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=final_text)]))
    return contents


# ── Signal detection ─────────────────────────────────────────────
_CRISIS_KW  = ["อยากตาย","ไม่อยากอยู่","จบแล้ว","พังหมด","ฆ่าตัว","ฆ่า"]
_EMOTION_KW = ["ท้อ","เสียใจ","กลัว","เครียด","ร้องไห้","หมดหวัง","ไม่ไหว",
               "เหนื่อยมาก","sad","cry","hopeless","panic","depressed","lonely","scared"]

def detect_crisis(text: str) -> bool:
    t = (text or "").lower()
    return any(w in t for w in _CRISIS_KW)

def detect_emotion(text: str) -> bool:
    t = (text or "").lower()
    return any(w in t for w in _EMOTION_KW)


# ── GeminiLLM class ──────────────────────────────────────────────
class GeminiLLM:
    def __init__(self, model: str = "gemini-2.5-flash"):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY2")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found")
        self.client    = genai.Client(api_key=self.api_key)
        self.model     = model
        self.max_retry = 4
        print(f"✅ King-Diadem GeminiLLM initialized with model: {model}")

    # ── low-level call ───────────────────────────────────────────
    def _call(self, system: str, contents: list,
              temperature: float = 0.72, max_tokens: int = 2048) -> str:
        cfg = types.GenerateContentConfig(
            system_instruction=system,
            temperature=temperature,
            max_output_tokens=max_tokens,
        )
        for attempt in range(self.max_retry):
            try:
                resp = self.client.models.generate_content(
                    model=self.model, contents=contents, config=cfg)
                return (resp.text or "").strip()
            except Exception as e:
                err = str(e).lower()
                if any(k in err for k in ["429","quota","rate limit","resource exhausted"]):
                    wait = (2 ** attempt) * 8
                    print(f"⚠ Rate limit — wait {wait}s (attempt {attempt+1})")
                    time.sleep(wait)
                elif any(k in err for k in ["invalid","authentication","api_key"]):
                    raise ValueError(f"Auth Error: {e}")
                else:
                    if attempt == self.max_retry - 1:
                        raise
                    time.sleep(3)
        raise Exception("GeminiLLM: max retries exceeded")

    # ── public: generate with history ───────────────────────────
    def generate_with_governance(
        self,
        prompt: str,
        additional_context: str = "",
        history: list = None,
        route: str = "general",
        voice_mode: str = "lyla",
    ) -> str:
        history = history or []

        # route tag
        route_tags = {
            "risk":     "[RISK MODE] วิเคราะห์ความเสี่ยงและผลกระทบ",
            "survival": "[SURVIVAL MODE] ความอยู่รอดพื้นฐาน — อาหาร ที่พัก ความปลอดภัย",
            "collapse": "[COLLAPSE MODE] ลูกโซ่ความเสียหายสะสม",
            "civil":    "[CIVIL MODE] งาน พลเมือง ความรับผิดชอบส่วนรวม",
            "vega":     "[VEGA MODE] อนาคต โลกกว้าง ทางเลือกระยะยาว",
        }
        route_note = route_tags.get(route, "")

        # สร้าง context note
        parts = []
        if route_note:
            parts.append(route_note)
        if additional_context:
            parts.append(additional_context)
        ctx_note = " | ".join(parts)

        # crisis check → VEGA emergency
        if detect_crisis(prompt) or voice_mode == "crisis":
            contents = _build_contents(history, prompt, ctx_note)
            return self._call(VEGA_SYSTEM, contents, temperature=0.5, max_tokens=800)

        # emotion check → VEGA
        if detect_emotion(prompt) or voice_mode == "vega":
            contents = _build_contents(history, prompt, ctx_note)
            return self._call(VEGA_SYSTEM, contents, temperature=0.65, max_tokens=1200)

        # normal → LYLA
        contents = _build_contents(history, prompt, ctx_note)
        return self._call(LYLA_SYSTEM, contents, temperature=0.72, max_tokens=2048)

    # ── backward compat ─────────────────────────────────────────
    def generate(self, prompt: str, system_prompt: Optional[str] = None,
                 temperature: float = 0.65, max_tokens: int = 2048) -> str:
        sys = system_prompt or LYLA_SYSTEM
        contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
        return self._call(sys, contents, temperature=temperature, max_tokens=max_tokens)
