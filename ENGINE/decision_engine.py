import os

try:
    from google import genai
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None
except Exception:
    client = None

from AI.intent_engine import analyze_intent
from INTELLIGENCE.risk_engine import evaluate_risk

class KingDiademEngine:
    def call_gemini(self, text):
        if not client:
            return None
        try:
            res = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=text
            )
            return res.text
        except Exception:
            return None

    def safe_fallback(self, text):
        return {
            "status": "fallback",
            "options": [
                "ลองใหม่",
                "ลดคำถาม",
                "หยุดพัก (SYSTEM PAUSE)"
            ]
        }

    def chat_mode(self, text):
        ai = self.call_gemini(text)
        if not ai:
            return self.safe_fallback(text)
        return {"type": "chat", "data": ai}

    def decision_mode(self, text):
        try:
            intent = analyze_intent(text)
            risk = evaluate_risk(text)

            if risk["risk_level"] == "high":
                return {"type": "decision", "data": "⚠️ เสี่ยงเกินไป หยุดก่อน"}

            if intent == "survival":
                return {"type": "decision", "data": "🛡️ เอาตัวรอดก่อน ลดรายจ่าย เพิ่มเงิน"}

            if intent == "question":
                return {"type": "decision", "data": "🤔 ต้องการข้อมูลเพิ่ม"}

            return {"type": "decision", "data": "✅ ทำได้ แต่คิดก่อน"}

        except Exception as e:
            return {
                "type": "error",
                "error": str(e),
                "fallback": self.safe_fallback(text)
            }

    def run(self, text, mode="chat"):
        if mode == "chat":
            return self.chat_mode(text)
        if mode == "decision":
            return self.decision_mode(text)
        return self.safe_fallback(text)
