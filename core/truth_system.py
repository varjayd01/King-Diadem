import os
import asyncio
from openai import AsyncOpenAI

# 🔥 Gemini (optional)
try:
    from google import genai
except:
    genai = None

# ✅ ชื่อไฟล์ต้องตรง (survivorengine ไม่ใช่ sovivorengine)
from ENGINE.realhuman_survivorengine import RealHumanSurvivorEngine, HumanState


KERNEL_PROMPT = """
[SYSTEM: ETERNAL TRUTH MODE]
สะท้อนความจริง + ให้ทางเลือกที่รอดจริงเท่านั้น
"""


class TruthSystem:
    def __init__(self):
        self.keys = {
            "gpt": os.getenv("CHATGPT_API_KEY"),
            "gemini": os.getenv("GEMINI_API_KEY")
        }

        # init client ครั้งเดียว
        self.gpt_client = AsyncOpenAI(api_key=self.keys["gpt"]) if self.keys["gpt"] else None

        if genai and self.keys["gemini"]:
            self.gemini_client = genai.Client(api_key=self.keys["gemini"])
        else:
            self.gemini_client = None

    async def gpt_view(self, context):
        if not self.gpt_client:
            return "[GPT KEY MISSING]"

        try:
            res = await self.gpt_client.chat.completions.create(
                model="gpt-4o-mini",  # ⚠️ เร็ว + เสถียรกว่า
                messages=[
                    {"role": "system", "content": KERNEL_PROMPT},
                    {"role": "user", "content": context}
                ]
            )
            return res.choices[0].message.content

        except Exception as e:
            return f"[GPT FAIL] {str(e)}"

    async def gemini_view(self, context):
        if not self.gemini_client:
            return "[Gemini unavailable]"

        try:
            res = self.gemini_client.models.generate_content(
                model="gemini-1.5-flash",
                contents=context
            )
            return res.text

        except Exception as e:
            return f"[Gemini FAIL] {str(e)}"


async def run_truth_infrastructure(user_input, state_dict):

    # ✅ 1. Survivor Engine
    try:
        survivor = RealHumanSurvivorEngine()
        h_state = HumanState(**state_dict)

        survival_out = survivor.run(h_state)

        survival_json = {
            "status": str(getattr(survival_out, "status", "unknown")),
            "actions": str(getattr(survival_out, "actions", "none"))
        }

    except Exception as e:
        survival_json = {"error": str(e)}

    # ✅ 2. Context Build
    context = f"""
สถานะระบบ:
{survival_json}

เหตุการณ์:
{user_input}
"""

    ts = TruthSystem()

    # ✅ 3. Run parallel แบบไม่ล่มทั้งระบบ
    results = await asyncio.gather(
        ts.gpt_view(context),
        ts.gemini_view(context),
        return_exceptions=True
    )

    # normalize exception
    clean_results = []
    for r in results:
        if isinstance(r, Exception):
            clean_results.append(f"[ERROR] {str(r)}")
        else:
            clean_results.append(r)

    return {
        "survival": survival_json,
        "perspectives": {
            "gpt": clean_results[0],
            "gemini": clean_results[1]
        }
    }


# 🔹 helper สำหรับ Flask เรียกง่าย (กัน async พัง)
def run_sync(user_input, state_dict):
    return asyncio.run(run_truth_infrastructure(user_input, state_dict))
