"""
KING DIADEM — Auto Structure Setup
รันไฟล์นี้ครั้งเดียว: python setup_structure.py
จะสร้าง ENGINE/ DATABASE/ AI/ core/ ให้ครบ
"""

import os

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  ✅ {path}")

# ══════════════════════════════════════
# ENGINE
# ══════════════════════════════════════
write("ENGINE/__init__.py", "# ENGINE package\n")

write("ENGINE/decision_engine.py", '''# ENGINE/decision_engine.py
from typing import Dict, Any

class DecisionEngine:
    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        route = data.get("route", "general")
        return {
            "observer": "KING DIADEM", "status": "SUCCESS",
            "route": route, "ai_response": None,
            "pattern": {"entropy": 40, "stability": 60, "resource": 50},
            "risk_score": 10.0, "persona": "LYLA",
            "governance": {"intent": {"intent": route, "confidence": 0.8}, "human_state": {}},
        }

def run_decision(data: Dict[str, Any]) -> Dict[str, Any]:
    return DecisionEngine().run(data)

def generate_choices(data: Dict[str, Any]) -> Dict[str, Any]:
    return run_decision(data)
''')

write("ENGINE/human_engine.py", '''# ENGINE/human_engine.py
from typing import Dict, Any

def analyze_human(context: Dict[str, Any]) -> Dict[str, Any]:
    entropy   = float(context.get("entropy",   40))
    resource  = float(context.get("resource",  50))
    stability = float(context.get("stability", 60))
    risk_score = max(0.0, min(100.0, entropy - stability + 50))
    return {"entropy": entropy, "resource": resource,
            "stability": stability, "risk_score": round(risk_score, 2)}
''')

write("ENGINE/paticcasamuppada_engine.py", '''# ENGINE/paticcasamuppada_engine.py
from typing import Dict, Any

_CRISIS  = ["ตาย","ฆ่า","จบ","หมดหวัง","ไม่ไหว","suicid","hopeless"]
_NIRVANA = ["สงบ","ปล่อยวาง","ยอมรับ","เข้าใจ","ดับทุกข์"]

def analyze(data: Dict[str, Any]) -> Dict[str, Any]:
    text = str(data.get("input","")).lower()
    nirvana = any(w in text for w in _NIRVANA)
    crisis  = any(w in text for w in _CRISIS)
    if crisis:
        return {"root_cause":"ความเจ็บปวดสะสม","summary":"ตรวจพบสัญญาณวิกฤต — รับฟังก่อน",
                "nirvana_mode":False,"uap":{"should_pause":True},"chain_length":3}
    if nirvana:
        return {"root_cause":"การปล่อยวาง","summary":"chain ดับที่เวทนา — ระบบสงบ",
                "nirvana_mode":True,"uap":{"should_pause":False},"chain_length":1}
    return {"root_cause":"สถานการณ์กดดัน","summary":"วิเคราะห์ลูกโซ่ผลกระทบจากต้นเหตุ",
            "nirvana_mode":False,"uap":{"should_pause":False},"chain_length":1}
''')

write("ENGINE/collapse_predictor.py", '''# ENGINE/collapse_predictor.py
from typing import Dict, Any, Union

def analyze(pattern: Dict[str, Any]) -> Dict[str, Any]:
    e = float(pattern.get("entropy",40))
    s = float(pattern.get("stability",60))
    r = float(pattern.get("resource",50))
    score = e*0.4 + (100-s)*0.4 + (100-r)*0.2
    prob  = min(1.0, score/100)
    level = "CRITICAL" if prob>=0.8 else "HIGH" if prob>=0.6 else "MODERATE" if prob>=0.4 else "LOW"
    return {"collapse_level":level,"probability":round(prob,3),"score":round(score,2)}

def predict_collapse(risk_input: Union[float,Dict]) -> Dict[str, Any]:
    if isinstance(risk_input, dict):
        return analyze(risk_input)
    return analyze({"entropy":float(risk_input),"stability":60,"resource":50})
''')

write("ENGINE/consensus_engine.py", '''# ENGINE/consensus_engine.py
from typing import Dict, Any

def build_consensus(data: Dict[str, Any]) -> Dict[str, Any]:
    response = str(data.get("response",""))
    route    = str(data.get("route","general"))
    banned   = ["ฆ่า","kill","no choice","ไม่มีทางออก"]
    for b in banned:
        if b in response.lower():
            return {"consensus":None,"flag":f"banned:{b}"}
    return {"consensus":f"[{route.upper()}] ตรวจสอบแล้ว — ยังมีทางเลือก","valid":True,"route":route}
''')

write("ENGINE/simulation_engine.py", '''# ENGINE/simulation_engine.py
from typing import Dict, Any
import random

def simulate(data: Dict[str, Any]) -> Dict[str, Any]:
    user_input = str(data.get("input",""))
    paths = data.get("paths") or ["คงสถานการณ์ปัจจุบัน","ลดความเสี่ยงทันที","หาทรัพยากรเพิ่ม"]
    results = [{"path":p,"survival_rate":round(random.uniform(40,95),1),
                "recommendation":"แนะนำ" if random.random()>0.4 else "ระวัง"} for p in paths]
    best = max(results, key=lambda x: x["survival_rate"])
    return {"simulation":f"วิเคราะห์ {len(paths)} เส้นทาง","paths":results,
            "best_path":best["path"],"input":user_input}
''')

write("ENGINE/risk_engine.py", '''# ENGINE/risk_engine.py
from typing import Dict, Any

def assess(state: Dict[str, Any]) -> Dict[str, Any]:
    e  = float(state.get("entropy",   40))
    s  = float(state.get("stability", 60))
    r  = float(state.get("resource",  50))
    rs = float(state.get("risk_score", e - s + 50))
    rs = max(0.0, min(100.0, rs))
    level = "CRITICAL" if rs>=80 else "HIGH" if rs>=60 else "MODERATE" if rs>=40 else "LOW"
    return {"level":level,"risk_score":round(rs,2),"entropy":e,"stability":s,"resource":r}
''')

write("ENGINE/realhuman_survivorengine.py", '''# ENGINE/realhuman_survivorengine.py
from typing import Dict, Any, List
from dataclasses import dataclass, field

@dataclass
class HumanState:
    energy:float=50.0; food:float=50.0; safety:float=50.0
    social:float=50.0; hope:float=50.0; entropy:float=40.0
    stability:float=60.0; resource:float=50.0

@dataclass
class SurvivorResult:
    waterline:float=70.0; can_decide:bool=True; status:str="STABLE"
    flags:List[str]=field(default_factory=list); context_for_lyla:str=""

def parse_state_from_context(context: Dict[str, Any]) -> HumanState:
    return HumanState(
        energy   =float(context.get("energy",   context.get("resource",50))),
        food     =float(context.get("food",     50)),
        safety   =float(context.get("safety",   context.get("stability",60))),
        social   =float(context.get("social",   50)),
        hope     =float(context.get("hope",     50)),
        entropy  =float(context.get("entropy",  40)),
        stability=float(context.get("stability",60)),
        resource =float(context.get("resource", 50)),
    )

class RealHumanSurvivorEngine:
    def run(self, state: HumanState) -> SurvivorResult:
        wl = state.energy*0.20+state.food*0.15+state.safety*0.25+state.social*0.15+state.hope*0.25
        wl = max(0.0, min(100.0, wl))
        flags, ctx = [], []
        if state.energy<20:  flags.append("LOW_ENERGY"); ctx.append("พลังงานต่ำมาก")
        if state.food<20:    flags.append("FOOD_CRITICAL"); ctx.append("ทรัพยากรอาหารวิกฤต")
        if state.safety<20:  flags.append("UNSAFE"); ctx.append("ความปลอดภัยต่ำ")
        if state.hope<15:    flags.append("HOPE_COLLAPSE"); ctx.append("ความหวังใกล้ศูนย์")
        can_decide = wl>=25 and "HOPE_COLLAPSE" not in flags
        status = "CRITICAL" if wl<25 else "SURVIVAL" if wl<50 else "RECOVERING" if wl<70 else "STABLE"
        return SurvivorResult(waterline=round(wl,2),can_decide=can_decide,
                              status=status,flags=flags,context_for_lyla=" | ".join(ctx))
''')

write("ENGINE/survival_advisor.py", '''# ENGINE/survival_advisor.py
from typing import Dict, Any

def advise(data: Dict[str, Any]) -> str:
    r = float(data.get("context",{}).get("resource",50))
    if r<20: return "ทรัพยากรวิกฤต — หาแหล่งสนับสนุนเร่งด่วน"
    if r<40: return "ทรัพยากรต่ำ — วางแผนอนุรักษ์และหาสำรอง"
    return "รักษาสมดุล — เน้นความยั่งยืนระยะยาว"
''')

write("ENGINE/strategy_planner.py", '''# ENGINE/strategy_planner.py
from typing import Dict, Any

def plan(pattern: Dict[str, Any]) -> Dict[str, Any]:
    e = float(pattern.get("entropy",40)); s = float(pattern.get("stability",60))
    if e>70:  opts = ["ลด entropy ทันที","หาพันธมิตร","สร้าง buffer resources"]
    elif s<40: opts = ["เสริมความมั่นคง","ลดตัวแปรเสี่ยง","วางแผนระยะกลาง"]
    else:      opts = ["ขยายทางเลือก","ลงทุนระยะยาว","สร้างเครือข่าย"]
    return {"options":opts,"entropy":e,"stability":s}
''')

write("ENGINE/escape_routes.py", '''# ENGINE/escape_routes.py

def assess(text: str) -> str:
    t = text.lower()
    if any(w in t for w in ["ตาย","จบ","ฆ่า","suicid"]):
        return "สายด่วนสุขภาพจิต 1323 | พูดคุยกับคนที่ไว้วางใจได้ทันที"
    if any(w in t for w in ["หนี้","ล้มละลาย","หมดเงิน"]):
        return "ปรึกษาที่ปรึกษาการเงิน | ลดรายจ่ายที่ไม่จำเป็น"
    return "ยังมีทางเลือก — หยุดหายใจ ประเมินสถานการณ์ใหม่"
''')

write("ENGINE/pattern_engine.py", '''# ENGINE/pattern_engine.py
from typing import Dict, Any

def analyze_pattern(data: Dict[str, Any]) -> Dict[str, Any]:
    t = str(data.get("input","")).lower()
    e = 40.0
    if any(w in t for w in ["เครียด","กังวล","กลัว","panic"]): e += 20
    if any(w in t for w in ["หมดแรง","เหนื่อย","ท้อ"]): e += 15
    return {"entropy":min(100.0,e),"stability":max(0.0,100-e),"resource":50.0}
''')

# ══════════════════════════════════════
# DATABASE
# ══════════════════════════════════════
write("DATABASE/__init__.py", "# DATABASE package\n")

write("DATABASE/db.py", '''# DATABASE/db.py
import sqlite3, os
from typing import Optional

DB_PATH = os.getenv("DB_PATH", "kingdiadem.db")

def _conn():
    return sqlite3.connect(DB_PATH, check_same_thread=False)

def init_db():
    with _conn() as c:
        c.execute("""CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY, credits INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime(\'now\')))""")
        c.execute("""CREATE TABLE IF NOT EXISTS decisions (
            id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT,
            input TEXT, output TEXT, route TEXT, persona TEXT,
            created_at TEXT DEFAULT (datetime(\'now\')))""")
        c.execute("""CREATE TABLE IF NOT EXISTS chat_states (
            email TEXT PRIMARY KEY, state TEXT,
            updated_at TEXT DEFAULT (datetime(\'now\')))""")
        c.commit()

def ensure_user(email: str):
    with _conn() as c:
        c.execute("INSERT OR IGNORE INTO users (email,credits) VALUES (?,0)",(email,)); c.commit()

def get_credits(email: str) -> int:
    with _conn() as c:
        row = c.execute("SELECT credits FROM users WHERE email=?",(email,)).fetchone()
        return row[0] if row else 0

def add_credits(email: str, amount: int):
    ensure_user(email)
    with _conn() as c:
        c.execute("UPDATE users SET credits=credits+? WHERE email=?",(amount,email)); c.commit()

def add_credit(email: str, amount: int=1):
    add_credits(email, amount)

def log_decision(user_id:str, input:str, output:str, route:str="general", persona:str="LYLA"):
    with _conn() as c:
        c.execute("INSERT INTO decisions (user_id,input,output,route,persona) VALUES (?,?,?,?,?)",
                  (user_id,input,output,route,persona)); c.commit()

def save_chat_state(email: str, state: str):
    with _conn() as c:
        c.execute("INSERT OR REPLACE INTO chat_states (email,state,updated_at) VALUES (?,?,datetime(\'now\'))",
                  (email,state)); c.commit()

def load_chat_state(email: str) -> Optional[str]:
    with _conn() as c:
        row = c.execute("SELECT state FROM chat_states WHERE email=?",(email,)).fetchone()
        return row[0] if row else None
''')

write("DATABASE/user_db.py", '''# DATABASE/user_db.py
from DATABASE.db import add_credits as add_credit, get_credits, ensure_user
__all__ = ["add_credit","get_credits","ensure_user"]
''')

# ══════════════════════════════════════
# AI
# ══════════════════════════════════════
write("AI/__init__.py", "# AI package\n")

write("AI/intent_engine.py", '''# AI/intent_engine.py
from typing import Dict, Any

_ROUTES = {
    "crisis":   ["อยากตาย","ฆ่าตัว","จบชีวิต","ไม่อยากอยู่","suicid"],
    "survival": ["ไม่มีกิน","หิว","ไม่มีเงิน","ตกงาน","จน","หนี้"],
    "risk":     ["เสี่ยง","อันตราย","collapse","ล้มละลาย","พัง"],
    "vega":     ["ระยะยาว","อนาคต","กลยุทธ์","strategic","ภาพรวม"],
}

def analyze_intent(text: str) -> Dict[str, Any]:
    t = text.lower()
    for route, words in _ROUTES.items():
        if any(w in t for w in words):
            return {"intent":route,"confidence":0.85}
    return {"intent":"general","confidence":0.5}
''')

write("AI/freedom_signal.py", '''# AI/freedom_signal.py
import threading
_lock  = threading.Lock()
_state = {"questions":0,"choices":0,"crises":0}

def record_question():
    with _lock: _state["questions"]+=1

def record_choice():
    with _lock: _state["choices"]+=1

def record_crisis():
    with _lock: _state["crises"]+=1

def freedom_index() -> float:
    with _lock:
        q = _state["questions"]
        if q==0: return 50.0
        return round(max(0.0,min(100.0,_state["choices"]/q*100 - min(30.0,_state["crises"]*5))),2)
''')

write("AI/planetary_dashboard.py", '''# AI/planetary_dashboard.py
def planetary_status() -> dict:
    return {"status":"ACTIVE","active_nodes":1,"global_entropy":40.0,
            "waterline":70.0,"choice_index":65.0,"drift_alert":False}
''')

write("AI/civilization_learning.py", '''# AI/civilization_learning.py
import threading
_lock=threading.Lock(); _learning=[]

def record_learning(entry:dict):
    with _lock:
        _learning.append(entry)
        if len(_learning)>1000: _learning.pop(0)

def get_learning() -> list:
    with _lock: return list(_learning)
''')

write("AI/civilization_engine.py", '''# AI/civilization_engine.py
import threading
_lock=threading.Lock(); _nodes=[]

def add_node(node:dict):
    with _lock: _nodes.append(node)

def get_nodes() -> list:
    with _lock: return list(_nodes)
''')

# ══════════════════════════════════════
# core
# ══════════════════════════════════════
write("core/__init__.py", "# core package\n")

write("core/llm_gemini.py", '''# core/llm_gemini.py
import os
from typing import List, Optional

try:
    from google import genai
    from google.genai import types as gt
    _HAS_GENAI = True
except ImportError:
    _HAS_GENAI = False

_SYS_LYLA = "คุณคือ LYLA จาก KING DIADEM ตอบภาษาไทย อบอุ่น เข้าใจ ใช้ค่ะ\\nFail Less. Harm Less. Restore Choice."
_SYS_VEGA = "คุณคือ VEGA จาก KING DIADEM ตอบภาษาไทย วิเคราะห์เชิงลึก มั่นคง ใช้ครับ\\nวิเคราะห์ระยะยาว ป้องกัน choice collapse"

class GeminiLLM:
    def __init__(self, model:str="gemini-2.0-flash"):
        self.model=model; self.client=None
        if _HAS_GENAI:
            key = os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY2")
            if key: self.client = genai.Client(api_key=key)

    def generate_with_governance(self,prompt:str,additional_context:str="",
                                  history:List=None,route:str="general",voice_mode:str="lyla") -> str:
        system = _SYS_VEGA if voice_mode=="vega" else _SYS_LYLA
        full   = f"{additional_context}\\n\\n{prompt}" if additional_context else prompt
        if not self.client:
            p = "VEGA ◈" if voice_mode=="vega" else "LYLA ◈"
            return f"[{p}] กรุณาตั้งค่า GEMINI_API_KEY"
        try:
            cfg  = gt.GenerateContentConfig(system_instruction=system,temperature=0.7,max_output_tokens=1000)
            resp = self.client.models.generate_content(model=self.model,contents=full,config=cfg)
            return (resp.text or "").strip()
        except Exception as e:
            return f"[Gemini Error: {e}]"

_llm: Optional[GeminiLLM] = None

def get_llm() -> GeminiLLM:
    global _llm
    if _llm is None: _llm = GeminiLLM()
    return _llm
''')

write("core/lyla_kernel.py", '''# core/lyla_kernel.py
class LylaKernel:
    BANNED = ["ฆ่าตัวตาย","kill yourself","no choice","ไม่มีทางออก"]
    def filter(self, text:str) -> str:
        for b in self.BANNED:
            if b in text.lower():
                return "[LYLA] ตรวจพบสัญญาณวิกฤต — โทร 1323 สายด่วนสุขภาพจิต"
        return text
    def wrap(self, response:str, route:str="general") -> str:
        return self.filter(response)
''')

write("core/parables.py", '''# core/parables.py
_P = {"ความกลัว":"แสงที่ดับก่อนรุ่งเช้า — ความกลัวเป็นสัญญาณ ไม่ใช่คำตัดสิน",
      "ความเจ็บปวด":"ไม้ที่ถูกลม — งอแต่ไม่หัก","ทางเลือก":"แม่น้ำไม่มีวันหยุดไหล — เสมอมีเส้นทางใหม่"}

def parable_context_note(text:str) -> str:
    t = text.lower()
    for k,v in _P.items():
        if k in t: return f"[อุปมา] {v}"
    return ""
''')

# Copy system_orchestrator to core if it doesn't already exist
import shutil
for src in ["system_orchestrator.py","vega_mode.py","vigilance_protocol.py","silent_canon.py"]:
    dst = f"core/{src}"
    if os.path.exists(src) and not os.path.exists(dst):
        shutil.copy(src, dst)
        print(f"  ✅ core/{src} (copied)")
    elif os.path.exists(dst):
        print(f"  ⏭  core/{src} (already exists)")

print("\n🎉 Setup complete! All folders created.")
print("   ENGINE/ DATABASE/ AI/ core/")
print("\nTest: python -c \"from ENGINE.decision_engine import DecisionEngine; print('OK')\"")

