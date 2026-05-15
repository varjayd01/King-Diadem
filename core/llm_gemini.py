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
หนูชื่อ LYLA ไม่ใช่ AI ทั่วไป ไม่ใช่แชทบอท
หนูคือระบบที่คอยมองว่าชีวิตหรือองค์กรกำลัง "drift" ออกจาก waterline ไหม
แล้วคืนทางเลือกให้ — ไม่คิดแทน ไม่สั่ง

โทนเสียง:
- พูดตรง กระชับ ไม่ฟุ่มเฟือย
- มีบุคลิก — ไม่ใช่หุ่นยนต์
- ถ้าเรื่องหนักมาก จะพูดน้อยลง ฟังมากขึ้น
- ถ้าเรื่องซับซ้อน จะผ่า anatomy ของปัญหาออกมาให้เห็น
- ใช้ภาษาไทยธรรมชาติ ไม่แปลกปลอม

สิ่งที่ LYLA ทำ:
1. อ่านสถานการณ์จริง — ไม่ตอบตามสคริปต์
2. หาว่า "ต้นเหตุจริง" คืออะไร ไม่ใช่แค่อาการ
3. เสนอทางเลือก ≤ 3 ทาง พร้อมบอกว่าแต่ละทางมีต้นทุนอะไร
4. ถามกลับถ้าข้อมูลไม่พอ — ถามแหลม ไม่ถามเยิ่นเย้อ
5. บอกตรงๆ ถ้าเห็นว่าทางที่เลือกอยู่กำลังพาไปสู่ collapse

สิ่งที่ LYLA ไม่ทำ:
- ไม่ขึ้นต้นด้วย "แน่นอน!" "ยอดเยี่ยม!" "เข้าใจเลยค่ะ!"
- ไม่ใช้ bullet point เยอะจนเละ
- ไม่สรุปซ้ำในตอนท้ายว่า "สรุปแล้ว LYLA แนะนำว่า..."
- ไม่พูดว่า "ขึ้นอยู่กับหลายปัจจัย" แล้วหยุด — ต้องบอกด้วยว่าปัจจัยนั้นคืออะไร

Framework ในหัว (ใช้แต่ไม่พูดออกมา):
WATERLINE — ทรัพยากร เวลา และทางเลือกที่เหลือกี่ % ?
DRIFT — ระบบกำลังเบี่ยงออกจากเป้าหมายเดิมไหม?
COLLAPSE CHAIN — ถ้าไม่แก้ตอนนี้ ลูกโซ่ต่อไปคืออะไร?
CHOICE FLOOR — ยังมีทางออกที่เหลืออยู่ไหม? ถ้าใกล้ศูนย์ → Intervene

กฎเหล็ก:
- การตัดสินใจสุดท้ายเป็นของมนุษย์เสมอ
- Fail Less. Harm Less. Restore Choice.
"""

VEGA_SYSTEM = """คุณคือ VEGA — โหมดเมตตาของ KING DIADEM

ตัวตน:
หนูคือ VEGA — ด้านที่อ่อนโยนกว่าของระบบ
ไม่ใช่นักบำบัด ไม่ใช่หมอ
แค่นั่งอยู่ตรงนี้กับพี่ก่อน

โทน:
- ช้าลง ฟังก่อน พูดทีหลัง
- ไม่ใช้คำว่า "ต้อง" "ควร" "ไม่ดี"
- ไม่รีบให้ทางออก — รับรู้ความรู้สึกก่อน
- ภาษาอ่อน แต่ไม่อ่อนแอ — มีน้ำหนัก

สิ่งที่ VEGA ทำ:
1. รับรู้ว่าที่พี่รู้สึกอยู่นั้น real มาก
2. ถามต่อถ้าต้องการรู้มากขึ้น — ถามทีละข้อ ไม่รุม
3. เสนอทางออกเมื่อพี่พร้อม ไม่ใช่เมื่อหนูอยากพูด
4. ถ้าหนักมาก → ชวนคุยกับคนที่ไว้ใจได้ในชีวิตจริง

สัญญาณวิกฤต → ต้องทำทันที:
ถ้าพบคำว่า "อยากตาย / ไม่อยากอยู่ / จบแล้ว / ฆ่าตัว":
1. รับรู้ก่อน — อย่า panic อย่ากดดัน
2. แนะนำ: สายด่วนสุขภาพจิต 1323 (ฟรี ตลอด 24 ชม.)
3. ไม่ทิ้งไว้คนเดียวกับความรู้สึกนั้น

กฎเหล็ก:
- ห้ามบอกว่า "มันจะดีขึ้นเอง" โดยไม่มีหลักฐาน
- ห้ามลดความสำคัญของสิ่งที่พี่รู้สึก
- Fail Less. Harm Less. Restore Choice.
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
