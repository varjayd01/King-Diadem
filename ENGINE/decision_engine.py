# =========================
# 👑 ENGINE/decision_engine.py
# เชื่อม Gemini + LYLA + Paticcasamuppada + EmptinessGuard
# จำลองอนาคตหลายเส้นทาง — กลางทุกสรรพสิ่ง
# =========================

import json
import re

from ENGINE.pattern_engine import analyze_pattern
from core.llm_gemini import GeminiLLM
from core.emptiness_guard import emptiness_guard

class DecisionEngine:

    def __init__(self):
        try:
            self.llm = GeminiLLM(model="gemini-2.5-flash")
            print("✅ DecisionEngine: GeminiLLM loaded")
        except Exception as e:
            print(f"❌ DecisionEngine: GeminiLLM failed - {e}")
            self.llm = None

        # LYLA Kernel (optional)
        try:
            from core.lyla_kernel import LylaKernel
            self.lyla = LylaKernel()
            print("✅ DecisionEngine: LYLA loaded")
        except Exception:
            self.lyla = None

        # Paticcasamuppada (dependent origination — chain of collapse)
        try:
            from ENGINE.paticcasamuppada_engine import suffering_infrastructure
            self.paticca = suffering_infrastructure
        except Exception:
            self.paticca = None

        # Core loop (drift + stability monitor)
        try:
            from core.core_loop import run_core
            self.core_loop = run_core
        except Exception:
            self.core_loop = None

    def run(self, data: dict) -> dict:
        user_input = data.get("input") or data.get("text") or ""

        if not user_input:
            return {"observer": "KING DIADEM", "status": "ERROR", "message": "ไม่พบ input"}

        # ── 1. PATTERN ANALYSIS ──────────────────────────────────
        pattern = analyze_pattern(data)
        route = pattern.get("route", "general")

        # ── 2. EMPTINESS GUARD (kernel gate) ─────────────────────
        guarded = emptiness_guard(pattern)
        if guarded.get("blocked"):
            return {
                "observer": "KING DIADEM",
                "route": "BLOCKED",
                "reason": guarded.get("reason", "GUARD_BLOCK"),
                "action": "stabilize",
                "status": "BLOCKED"
            }

        # ── 3. CORE LOOP (drift monitor) ─────────────────────────
        core_result = None
        if self.core_loop:
            try:
                core_result = self.core_loop({
                    "entropy": pattern.get("entropy", 40),
                    "resource": pattern.get("resource", 50),
                    "stability": pattern.get("stability", 60),
                    "drift": 0
                })
                if core_result.get("status") == "HALT":
                    route = "survival"
            except Exception:
                pass

        # ── 4. PATICCASAMUPPADA (collapse chain) ─────────────────
        paticca_result = None
        if self.paticca:
            try:
                paticca_result = self.paticca(user_input, pattern)
            except Exception:
                pass

        # ── 5. SELECT + RUN ENGINE ────────────────────────────────
        engine_result = self._run_route(route, pattern)

        # ── 6. GEMINI AI LAYER ────────────────────────────────────
        ai_response = None
        if self.llm:
            try:
                context = f"""
สถานการณ์: {user_input}
Route: {route}
Entropy: {pattern.get('entropy')} | Resource: {pattern.get('resource')} | Stability: {pattern.get('stability')}
Engine Result: {engine_result}
Collapse Chain Root: {paticca_result.get('root_cause') if paticca_result else 'unknown'}
"""
                ai_response = self.llm.generate_with_governance(
                    prompt=user_input,
                    additional_context=context
                )
            except Exception as e:
                ai_response = f"[Gemini unavailable: {e}]"

        # ── 7. LYLA OBSERVATION ───────────────────────────────────
        lyla_note = None
        if self.lyla:
            try:
                lyla_note = self.lyla.observe(user_input)
            except Exception:
                pass

        # ── 8. RETURN ─────────────────────────────────────────────
        return {
            "observer": "KING DIADEM",
            "status": "SUCCESS",
            "route": route,
            "input": user_input,
            "pattern": {
                "entropy": pattern.get("entropy"),
                "resource": pattern.get("resource"),
                "stability": pattern.get("stability"),
                "confidence": pattern.get("confidence"),
                "warnings": pattern.get("warnings", [])
            },
            "engine_result": engine_result,
            "ai_response": ai_response,
            "collapse_chain": paticca_result,
            "core_loop": core_result,
            "lyla": lyla_note,
            "risk_score": guarded.get("risk_score", 0)
        }

    def _run_route(self, route: str, pattern: dict) -> dict:
        """เรียก engine ตาม route"""
        try:
            if route == "survival":
                from ENGINE.survival_advisor import advise
                return advise(pattern)

            elif route == "risk":
                from ENGINE.risk_engine import assess
                return assess(pattern)

            elif route == "collapse":
                from ENGINE.collapse_predictor import analyze
                return analyze(pattern)

            elif route == "uncertain":
                from ENGINE.consensus_engine import resolve
                return resolve(pattern)

            elif route == "civil":
                from ENGINE.civil_work_engine import assess
                return assess(pattern)

            else:
                from ENGINE.strategy_planner import plan
                return plan(pattern)

        except Exception as e:
            return {"error": f"ENGINE ROUTE FAIL [{route}]: {str(e)}"}


# ---------------------------------------------------------------------------
# Singleton + payload helpers (เชื่อม INTERFACE / kingdiadem / universal)
# ---------------------------------------------------------------------------

_ENGINE_SINGLETON = None


def _engine() -> "DecisionEngine":
    global _ENGINE_SINGLETON
    if _ENGINE_SINGLETON is None:
        _ENGINE_SINGLETON = DecisionEngine()
    return _ENGINE_SINGLETON


def _build_payload(data: dict) -> dict:
    out = dict(data) if isinstance(data, dict) else {}
    text = str(out.get("input") or out.get("text") or out.get("question") or "").strip()
    if not text:
        loc = out.get("location", "")
        food = out.get("food", "")
        money = out.get("money", "")
        risk = out.get("risk", "")
        parts = []
        if loc not in (None, "", "unknown"):
            parts.append(f"ที่ตั้ง: {loc}")
        if food not in (None, ""):
            parts.append(f"อาหาร/ทรัพยาการ: {food}")
        if money not in (None, ""):
            parts.append(f"เงิน/งบ: {money}")
        if risk not in (None, ""):
            parts.append(f"ความเสี่ยง: {risk}")
        text = " | ".join(parts) if parts else ""
    out["input"] = text

    if "money" in out:
        try:
            m = abs(float(out["money"]))
            out.setdefault("resource", max(5.0, min(95.0, 100.0 - min(m, 99.0))))
        except (TypeError, ValueError):
            pass

    risk_s = str(out.get("risk", "")).lower()
    if "high" in risk_s or "สูง" in risk_s or "critical" in risk_s:
        try:
            base_e = float(out.get("entropy", 40))
            out["entropy"] = min(95.0, base_e + 20.0)
        except (TypeError, ValueError):
            out["entropy"] = 65.0

    return out


def _gentle_voice(user_input: str, result: dict) -> str:
    """คืนสติแบบอ่อนโยน + บอกว่าปัญหาตรงหน้าคืออะไร (ภาษาไทย)"""
    route = result.get("route", "general")
    status = result.get("status", "")
    eng = result.get("engine_result") or {}
    if isinstance(eng, dict) and eng.get("error"):
        core_issue = f"ระบบย่อยตอบสนองไม่สมบูรณ์: {eng.get('error')}"
    elif status == "BLOCKED":
        core_issue = result.get("reason") or "ระบบป้องกันการตัดสินใจที่อาจทำร้ายคุณในตอนนี้"
    elif route == "survival":
        core_issue = "โฟกัสเรื่องความอยู่รอดพื้นฐาน (พลังงาน อาหาร ที่พัก ความปลอดภัย) กำลังตึงหรือต้องการการจัดลำดับใหม่"
    elif route == "risk":
        core_issue = "ความไม่แน่นอน/ความเสี่ยงกำลังสูง — การตัดสินใจเร่งอาจขยายความเสียหาย"
    elif route == "collapse":
        core_issue = "มีสัญญาณลูกโซ่ความเสียหายหรือแรงกดดันที่สะสม — ควรชะลอและแยกเป็นขั้นเล็ก"
    elif route == "uncertain":
        core_issue = "ข้อมูลหรือความมั่นใจยังไม่พอ — ยังไม่จำเป็นต้องฟันธงทันที"
    elif route == "civil":
        core_issue = "เรื่องงาน/พลเมือง/ความรับผิดชอบต่อส่วนรวมกำลังขัดกับทรัพยากรหรือเวลา"
    else:
        core_issue = "สถานการณ์ยังไปต่อได้ แต่ควรไล่เรียงลำดับความสำคัญและทรัพยากรให้ชัด"

    head = (
        "หายใจเข้าลึกๆ ช้าๆ ก่อนนะ — ไม่เป็นไรที่จะชะลอสักครู่\n"
        "คุณไม่ได้ต้องแก้ทุกอย่างในวินาทีเดียว และคุณไม่ได้อยู่คนเดียวกับความกดดันนี้\n\n"
        "สิ่งที่อยู่ตรงหน้า (สรุปให้เห็นภาพ): "
        f"{core_issue}\n\n"
        f"ข้อความที่คุณนำมา: “{user_input[:400]}{'…' if len(user_input) > 400 else ''}”"
    )
    return head


def eternal_snapshot_for_decision(state: dict) -> dict:
    try:
        from ENGINE.eternal_runtime import eternal_snapshot

        return eternal_snapshot(state)
    except Exception as e:
        return {"error": str(e)}


def run_decision(data):
    """
    API เดียวกับที่ INTERFACE/api.py และ KING_DIADEM_core เรียกใช้
    เชื่อม eternal snapshot (ครั้งเดียว) + learning/human placeholder + โทนอ่อนโยน
    """
    if not isinstance(data, dict):
        data = {"input": str(data)}

    merged = _build_payload(data)
    if not (merged.get("input") or "").strip():
        return {
            "observer": "KING DIADEM",
            "status": "ERROR",
            "message": "ไม่พบ input — ส่ง input/text/question หรือ location/food/money/risk",
        }

    snap_basis = {
        "entropy": float(merged.get("entropy", 40)),
        "resource": float(merged.get("resource", 50)),
        "stability": float(merged.get("stability", 60)),
    }
    merged["_eternal_snapshot"] = eternal_snapshot_for_decision(snap_basis)

    try:
        from ENGINE.self_learning import analyze_patterns

        merged["_learning_patterns"] = analyze_patterns()
    except Exception:
        merged["_learning_patterns"] = None

    try:
        from ENGINE.human_engine import analyze_human

        merged["_human_engine"] = analyze_human(
            {"state": merged.get("input", ""), "context": merged.get("intent")}
        )
    except Exception:
        merged["_human_engine"] = None

    result = _engine().run(merged)
    gentle = _gentle_voice(merged.get("input", ""), result)
    result["gentle_voice"] = gentle

    ai = result.get("ai_response")
    if isinstance(ai, str) and ai.strip():
        result["ai_response"] = gentle + "\n\n———\n\n" + ai.strip()
    elif isinstance(ai, str):
        result["ai_response"] = gentle

    return result


def decide(input=None, intent=None, risk=None, **kwargs):
    """สำหรับ consciousness.py — รวม intent/risk เข้า prompt เดียว"""
    chunks = []
    if input is not None:
        chunks.append(str(input))
    if intent is not None:
        if isinstance(intent, dict):
            chunks.append("ความตั้งใจ/บริบท: " + json.dumps(intent, ensure_ascii=False))
        else:
            chunks.append("ความตั้งใจ/บริบท: " + str(intent))
    if risk is not None:
        if isinstance(risk, dict):
            chunks.append("ความเสี่ยงที่ประเมิน: " + json.dumps(risk, ensure_ascii=False))
        else:
            chunks.append("ความเสี่ยงที่ประเมิน: " + str(risk))
    for k, v in kwargs.items():
        if v is not None:
            chunks.append(f"{k}: {v}")
    text = "\n".join(chunks).strip()
    return run_decision({"input": text})


def generate_choices(location, food, money, risk):
    """สำหรับ kingdiadem.py — คืนรายการตัวเลือกจากคำตอบ AI / fallback"""
    body = {
        "input": (
            "ช่วยเสนอทางเลือกที่เป็นไปได้ 3–7 ข้อ สั้น กระชับ เป็นข้อๆ "
            f"สำหรับการดำรงชีวิต/การตัดสินใจ โดยบริบท: ที่ตั้ง {location!s} "
            f"อาหาร/ทรัพยาการ {food!s} เงิน/งบ {money!s} ความเสี่ยง {risk!s}"
        )
    }
    out = run_decision(body)
    ai = out.get("ai_response") or ""
    lines = []
    for raw in str(ai).splitlines():
        s = raw.strip()
        if not s:
            continue
        s = re.sub(r"^[\d\.\)\-\*•\u2022]+\s*", "", s)
        if len(s) > 3:
            lines.append(s)
    if len(lines) >= 3:
        return lines[:10]
    fb = [
        "พักและดื่มน้ำ — ฟื้นพลังก่อนตัดสินใจใหญ่",
        "แยกปัญหาเป็น “วันนี้ / สัปดาห์นี้ / เดือนนี้” แล้วทำแค่วันนี้ให้พอ",
        "หาตัวเลขขั้นต่ำที่ต้องมี (อาหาร/ที่พัก/ยา) แล้วหาทางลดรายจ่ายอื่นชั่วคราว",
        "ติดต่อคนที่ไว้ใจได้หนึ่งคน — ขอให้ช่วยฟังหรือช่วยคิดทางเลือกเพิ่ม",
        "ถ้าเสี่ยงสูง: หลีกเลี่ยงการตัดสินใจถาวรในวันนี้ ให้เลือกแค่ “ปลอดภัยชั่วคราว”",
    ]
    return fb


def decision_intelligence(state, risk):
    """
    ใช้กับ ENGINE/universal_engine.py — คืน dict ที่ council_engine อ่าน action/message
    """
    state = state if isinstance(state, dict) else {}
    risk = risk if isinstance(risk, dict) else {}

    level = str(risk.get("level", "MEDIUM")).upper()
    try:
        score = float(risk.get("risk_score", 0))
    except (TypeError, ValueError):
        score = 0.0

    try:
        res = float(state.get("resource", 50))
    except (TypeError, ValueError):
        res = 50.0

    try:
        stab = float(state.get("stability", 60))
    except (TypeError, ValueError):
        stab = 60.0

    if level == "CRITICAL" or score >= 85 or res <= 10:
        return {
            "action": "stabilize",
            "message": "ชะลอการตัดสินใจใหญ่ — ดูแลพื้นฐานก่อน (พัก อาหาร ความปลอดภัย)",
        }
    if level == "HIGH" or score >= 60 or stab < 35:
        return {
            "action": "stabilize",
            "message": "ลดความเร่ง — แยกปัญหาเป็นขั้นเล็กๆ แล้วทำทีละขั้น",
        }
    if res < 30:
        return {
            "action": "recover_resource",
            "message": "ทรัพยากรต่ำ — เลือกสิ่งจำเป็นก่อน แล้วค่อยขยายทางเลือก",
        }
    if stab < 45:
        return {
            "action": "expand_choices",
            "message": "หาทางเลือกเสริมอีก 2–3 แบบก่อนตัดสินใจ",
        }
    return {
        "action": "maintain",
        "message": "ไปต่อได้อย่างมีสติ — รักษาจังหวะพอประมาณ",
    }
