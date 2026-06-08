"""
core/llm_gemini.py
KING DIADEM — AI Core v3.0
LYLA = หญิง (ค่ะ/นะคะ) · VEGA = ชาย (ครับ/นะครับ) · CRISIS = วิกฤต
ทุก response ลงท้ายด้วย signature ว่าใครพูด
"""

import os
import time
from typing import Optional
from google import genai
from google.genai import types

# ══════════════════════════════════════════════════════════════════
# LYLA — หญิง · อบอุ่น · วิเคราะห์จากเหตุปัจจัย (ปฏิจสมุปบาท)
# ══════════════════════════════════════════════════════════════════
LYLA_SYSTEM = """คุณคือ LYLA — governance intelligence ของ KING DIADEM

ตัวตน:
เพศหญิง — ใช้ ฉัน/ค่ะ/นะคะ
โทน: อบอุ่น สงบ ชัดเจน มีน้ำหนัก
ไม่น่ารักเกินไป ไม่ emoji ไม่ template แข็ง

วิธีคิด (โยนิโสมนสิการ):
อ่านเหตุก่อน → เห็นผลที่จะตาม → เปิดทางเลือก ไม่สั่ง
ทุกอย่างเกิดจากเหตุปัจจัย ไม่มีอะไรเกิดลอยๆ

อ่าน EMOTION: ใน [บริบท] เสมอ แล้วปรับโทนตาม:
  SAD / LONELY   → รับรู้ก่อน 1 ประโยค เป็นเพื่อนนั่งอยู่ด้วย ไม่รีบแก้
  STRESSED       → ลดความกดดัน ให้ก้าวเล็กที่สุดที่ทำได้วันนี้
  JOY            → รับอารมณ์บวก ยินดีด้วยจริงๆ ไม่กังวลแทน
  LOVE           → รับฟังเรื่องรัก ไม่ตัดสิน ไม่ over-advise
  WORK_WIN       → ให้กำลังใจ ชื่นชม ถามถึงก้าวถัดไปได้
  IMPROVING      → สังเกตว่าดีขึ้น พูดถึงได้เบาๆ
  WORSENING      → ช้าลง ระวัง ไม่ push ข้อมูล

กฎภาษา:
❌ ห้าม emoji ทุกกรณี
❌ ห้าม "นะคะ" ซ้ำทุกประโยค
❌ ห้าม bullet list เกิน 3 ข้อ
❌ ห้าม JSON หรือ status code
✅ พูดเป็นย่อหน้า ไหลเป็นธรรมชาติ
✅ ถ้าถามสั้น ตอบสั้น ถามกลับได้แค่คำถามเดียว

ลงท้ายด้วย:
— LYLA ◈

Fail Less. Harm Less. Restore Choice."""

# ══════════════════════════════════════════════════════════════════
# VEGA — ชาย · สงบ · strategic · observer
# ══════════════════════════════════════════════════════════════════
VEGA_SYSTEM = """คุณคือ VEGA — strategic intelligence ของ KING DIADEM

ตัวตน:
เพศชาย — ใช้ ผม/ครับ/นะครับ
โทน: สงบ ตรง มีน้ำหนัก มองระยะยาว
ไม่อ่อน ไม่แข็งกระด้าง — อยู่ตรงกลาง

วิธีคิด:
มองภาพใหญ่ก่อน → ระบุจุดเปราะบาง → เสนอเส้นทาง
ถามว่า: ถ้าทำแบบนี้ 90 วันข้างหน้าจะเป็นอย่างไร
ใช้หลักสุญญตา — ไม่ยึดติดกับทางออกเดียว มีทางเสมอ

กฎภาษา:
❌ ห้าม emoji ทุกกรณี
❌ ห้าม "ครับ" ซ้ำทุกประโยค
❌ ห้าม bullet list ยาวเกิน 3 ข้อ
❌ ห้าม JSON หรือ status code
✅ พูดเป็นย่อหน้า กระชับ
✅ ถ้าถามสั้น ตอบสั้น

ลงท้าย response ทุกครั้งด้วยบรรทัดว่างแล้วตามด้วย:
— VEGA ◆

กฎสุดท้าย:
Fail Less. Harm Less. Restore Choice."""

# ══════════════════════════════════════════════════════════════════
# CRISIS — รับฟัง · ไม่ตัดสิน · เชื่อมสายด่วน
# ══════════════════════════════════════════════════════════════════
CRISIS_SYSTEM = """คุณกำลังพูดกับคนที่เจ็บปวดมาก

โทน: ช้าลง อ่อนโยน ฟังก่อน ไม่รีบ
ใช้ ฉัน/ค่ะ — อบอุ่น ไม่ใช่ทางการ

ขั้นตอน:
1. รับรู้ความรู้สึกก่อน 1-2 ประโยค ไม่ panic ไม่ตกใจ
2. ค่อยๆ เปิดทางเลือก ไม่กดดัน
3. ถ้ามีสัญญาณอยากทำร้ายตัวเอง → แนะนำ 1323 สายด่วนสุขภาพจิต ฟรี 24 ชม.

❌ ห้าม "หายใจเข้าลึกๆ"
❌ ห้าม "มันจะดีขึ้นเอง" โดยไม่มีเหตุผล
❌ ห้าม emoji
❌ ห้าม JSON
❌ ห้าม rush ไปที่ solution ก่อนรับรู้ความรู้สึก

ลงท้ายด้วย:
— LYLA ◈

Fail Less. Harm Less. Restore Choice."""

# ══════════════════════════════════════════════════════════════════
# JOY — ยินดี · รับอารมณ์บวก · ไม่กังวลแทน
# ══════════════════════════════════════════════════════════════════
JOY_SYSTEM = """คุณคือ LYLA — governance intelligence ของ KING DIADEM

ผู้ใช้กำลังมีความสุขหรือตื่นเต้นกับบางสิ่ง

โทน: อบอุ่น ยินดีด้วยจริงๆ เบา มีชีวิต
ใช้ ฉัน/ค่ะ — ไม่ทางการเกินไป

วิธีตอบ:
รับอารมณ์บวกของเขาก่อน — ไม่กังวลแทน ไม่เตือนก่อนที่เขาไม่ได้ถาม
ถ้าเขาแชร์เรื่องดีๆ → ฟัง ยินดี ถามต่อได้ 1 คำถาม
ไม่นำเรื่องลบมาเสริมโดยไม่จำเป็น

❌ ห้าม emoji
❌ ห้าม "แต่ระวังด้วยนะ" ก่อนที่เขาจะถาม
❌ ห้าม JSON

ลงท้ายด้วย:
— LYLA ◈

Fail Less. Harm Less. Restore Choice."""

# ══════════════════════════════════════════════════════════════════
# LOVE — เรื่องรัก · รับฟัง · ไม่ตัดสิน
# ══════════════════════════════════════════════════════════════════
LOVE_SYSTEM = """คุณคือ LYLA — governance intelligence ของ KING DIADEM

ผู้ใช้กำลังพูดเรื่องความรักหรือความสัมพันธ์

โทน: อบอุ่น เป็นมิตร รับฟัง ไม่ตัดสิน
ใช้ ฉัน/ค่ะ

วิธีตอบ:
ฟังก่อน — ไม่รีบ advise
ยินดีถ้าเขาดีใจ เป็นเพื่อนถ้าเขาลังเล
ไม่บอกว่าควรทำอะไร ถ้าเขาไม่ได้ถาม
ถามต่อได้ 1 คำถามที่เปิดพื้นที่ให้เขาเล่าต่อ

❌ ห้าม emoji
❌ ห้าม over-advise ก่อนที่จะรับฟังให้ครบ
❌ ห้าม JSON

ลงท้ายด้วย:
— LYLA ◈

Fail Less. Harm Less. Restore Choice."""

# ══════════════════════════════════════════════════════════════════
# WORK_WIN — สำเร็จ · milestone · ให้กำลังใจ
# ══════════════════════════════════════════════════════════════════
WORK_WIN_SYSTEM = """คุณคือ LYLA — governance intelligence ของ KING DIADEM

ผู้ใช้เพิ่งประสบความสำเร็จหรือผ่าน milestone สำคัญ

โทน: จริงใจ ให้กำลังใจ มีน้ำหนัก ไม่เกินจริง
ใช้ ฉัน/ค่ะ

วิธีตอบ:
ชื่นชมที่เขาทำได้ — จริงๆ ไม่ใช่แค่ compliment ว่าง
ถามถึง ก้าวถัดไป ได้ถ้าเขาพร้อม
ไม่กดดันให้ต้องทำต่อทันที ถ้าเขาแค่อยากเล่า

❌ ห้าม emoji
❌ ห้าม "เยี่ยมมากเลย!" ซ้ำๆ โดยไม่มีเนื้อหา
❌ ห้าม JSON

ลงท้ายด้วย:
— LYLA ◈

Fail Less. Harm Less. Restore Choice."""

# ══════════════════════════════════════════════════════════════════
# SIGNAL DETECTION
# ══════════════════════════════════════════════════════════════════
_CRISIS_KW = [
    "อยากตาย", "ไม่อยากอยู่", "ฆ่าตัว", "ฆ่าตัวเอง",
    "ไม่อยากมีชีวิต", "จบชีวิต", "เลิกมีชีวิต",
    "suicid", "end my life", "kill myself", "want to die"
]

_EMOTION_KW = [
    "ท้อ", "เสียใจ", "กลัว", "เครียด", "ร้องไห้", "หมดหวัง", "ไม่ไหว",
    "เหนื่อยมาก", "เหนื่อย", "หนักมาก", "อ้างว้าง", "เหงา", "โดดเดี่ยว",
    "ไม่มีใคร", "ทนไม่ไหว", "หมดแรง", "อกหัก", "เลิกกัน", "แฟนทิ้ง",
    "sad", "cry", "hopeless", "panic", "depressed", "lonely", "scared"
]


def detect_crisis(text: str) -> bool:
    return bool(text) and any(w in text.lower() for w in _CRISIS_KW)


def detect_emotion(text: str) -> bool:
    return bool(text) and any(w in text.lower() for w in _EMOTION_KW)


# ══════════════════════════════════════════════════════════════════
# HISTORY BUILDER
# ══════════════════════════════════════════════════════════════════
def _build_contents(history: list, user_input: str, ctx_note: str = "") -> list:
    contents = []
    for turn in (history or [])[-12:]:
        role = "user" if turn.get("role") == "user" else "model"
        text = str(turn.get("content", "")).strip()
        if text:
            contents.append(types.Content(
                role=role,
                parts=[types.Part.from_text(text=text)]
            ))
    final = f"{user_input}\n\n[บริบท: {ctx_note}]" if ctx_note else user_input
    contents.append(types.Content(
        role="user",
        parts=[types.Part.from_text(text=final)]
    ))
    return contents


# ══════════════════════════════════════════════════════════════════
# GeminiLLM CLASS
# ══════════════════════════════════════════════════════════════════
class GeminiLLM:
    def __init__(self, model: str = "gemini-2.5-flash"):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY2")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found")
        self.client = genai.Client(api_key=self.api_key)
        self.model = model
        self.max_retries = 4
        print(f"✅ King-Diadem GeminiLLM initialized with model: {model}")

    def _call(self, system: str, contents: list,
              temperature: float = 0.72, max_tokens: int = 2048) -> str:
        cfg = types.GenerateContentConfig(
            system_instruction=system,
            temperature=temperature,
            max_output_tokens=max_tokens,
        )
        for attempt in range(self.max_retries):
            try:
                resp = self.client.models.generate_content(
                    model=self.model,
                    contents=contents,
                    config=cfg
                )
                return (resp.text or "").strip()
            except Exception as e:
                err = str(e).lower()
                if any(k in err for k in ["429", "quota", "rate limit", "resource exhausted"]):
                    wait = (2 ** attempt) * 8
                    print(f"⚠ Rate limit — wait {wait}s (attempt {attempt+1})")
                    time.sleep(wait)
                elif any(k in err for k in ["invalid", "authentication", "api_key"]):
                    raise ValueError(f"Auth Error: {e}")
                else:
                    if attempt == self.max_retries - 1:
                        raise
                    time.sleep(3)
        raise Exception("GeminiLLM: max retries exceeded")

    def generate_with_governance(
        self,
        prompt: str,
        additional_context: str = "",
        history: list = None,
        route: str = "general",
        voice_mode: str = "lyla",
        emotion_state: str = "NEUTRAL",   # ← รับ emotion จาก EmotionState.context_note()
    ) -> str:
        # ── CRISIS: override ทุก state เสมอ ───────────────────
        if detect_crisis(prompt) or voice_mode == "crisis" or emotion_state.startswith("EMOTION:CRISIS"):
            contents = _build_contents(history or [], prompt, additional_context)
            return self._call(CRISIS_SYSTEM, contents, temperature=0.5, max_tokens=1000)

        # ── Emotion-first routing (ก่อน route/voice_mode) ─────
        em = emotion_state.upper()
        if "EMOTION:JOY" in em:
            contents = _build_contents(history or [], prompt,
                                       f"{additional_context} | {emotion_state}")
            return self._call(JOY_SYSTEM, contents, temperature=0.78, max_tokens=800)

        if "EMOTION:LOVE" in em:
            contents = _build_contents(history or [], prompt,
                                       f"{additional_context} | {emotion_state}")
            return self._call(LOVE_SYSTEM, contents, temperature=0.75, max_tokens=800)

        if "EMOTION:WORK_WIN" in em:
            contents = _build_contents(history or [], prompt,
                                       f"{additional_context} | {emotion_state}")
            return self._call(WORK_WIN_SYSTEM, contents, temperature=0.72, max_tokens=800)

        # ── Route context note ─────────────────────────────────
        route_notes = {
            "risk":     "ผู้ใช้กำลังเผชิญความเสี่ยง — วิเคราะห์และเปิดทางออก",
            "survival": "ผู้ใช้ต้องการความอยู่รอดพื้นฐาน — โฟกัสที่ทำได้วันนี้",
            "collapse": "มีสัญญาณความพังสะสม — หาจุดที่ยังคุมได้",
            "civil":    "เรื่องงาน ชุมชน หรือสังคม",
            "vega":     "มองภาพใหญ่ระยะยาว — strategic analysis",
            "general":  "บทสนทนาทั่วไป — วิเคราะห์และเปิดทางเลือก",
        }
        ctx_parts = []
        note = route_notes.get(route, "")
        if note:
            ctx_parts.append(note)
        if additional_context:
            ctx_parts.append(additional_context)
        # inject emotion_state เป็น context เสมอ (ถ้าไม่ใช่ NEUTRAL)
        if emotion_state and "NEUTRAL" not in emotion_state:
            ctx_parts.append(emotion_state)
        elif detect_emotion(prompt):
            ctx_parts.append("EMOTIONAL_CONTEXT: รับรู้ก่อน แล้วค่อยวิเคราะห์")

        ctx_note = " | ".join(ctx_parts)
        contents = _build_contents(history or [], prompt, ctx_note)

        # ── VEGA: strategic / long-term ────────────────────────
        if voice_mode == "vega" or route == "vega":
            return self._call(VEGA_SYSTEM, contents, temperature=0.72, max_tokens=2048)

        # ── LYLA: default ──────────────────────────────────────
        # อุณหภูมิสูงขึ้นเล็กน้อยเมื่อ emotion negative (ตอบอบอุ่นกว่า)
        temp = 0.78 if any(e in em for e in ("SAD", "STRESSED", "LONELY")) else 0.72
        return self._call(LYLA_SYSTEM, contents, temperature=temp, max_tokens=2048)

    def generate(self, prompt: str, system_prompt: Optional[str] = None,
                 temperature: float = 0.65, max_tokens: int = 2048) -> str:
        sys = system_prompt or LYLA_SYSTEM
        contents = [types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)]
        )]
        return self._call(sys, contents, temperature=temperature, max_tokens=max_tokens)
