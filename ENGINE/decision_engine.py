# ENGINE/decision_engine.py
# KING DIADEM — Decision Engine · กลางทุกสรรพสิ่ง
# v5.0 — เชื่อม engine_router + UDOK v2.0 paticcasamuppada
# ตรรกะ: paticca อ่านเวทนา → router ตัดสิน route → LLM ตอบ

import json
import re

from ENGINE.pattern_engine import analyze_pattern
from core.llm_gemini import GeminiLLM
from core.emptiness_guard import emptiness_guard


class DecisionEngine:

    def __init__(self):
        # ── LLM ──────────────────────────────────────────────
        try:
            self.llm = GeminiLLM(model="gemini-2.5-flash")
            print("✅ DecisionEngine: GeminiLLM loaded")
        except Exception as e:
            print(f"❌ DecisionEngine: GeminiLLM failed - {e}")
            self.llm = None

        # ── LYLA Kernel ───────────────────────────────────────
        try:
            from core.lyla_kernel import LylaKernel
            self.lyla = LylaKernel()
            print("✅ DecisionEngine: LYLA loaded")
        except Exception:
            self.lyla = None

        # ── UDOK v2.0 — paticcasamuppada ─────────────────────
        # ใช้ analyze() ใหม่ที่คืน kill_zone + UAP + nirvana_mode
        try:
            from ENGINE.paticcasamuppada_engine import analyze as paticca_analyze
            self.paticca = paticca_analyze
            print("✅ DecisionEngine: paticcasamuppada UDOK v2.0 loaded")
        except Exception as e:
            print(f"⚠️  DecisionEngine: paticca fallback - {e}")
            self.paticca = None

        # ── Engine Router ─────────────────────────────────────
        try:
            from ENGINE.engine_router import run as router_run
            self.router = router_run
            print("✅ DecisionEngine: engine_router loaded")
        except Exception as e:
            print(f"⚠️  DecisionEngine: router fallback - {e}")
            self.router = None

        # ── Core Loop ─────────────────────────────────────────
        try:
            from core.core_loop import run_core
            self.core_loop = run_core
        except Exception:
            self.core_loop = None

    # ══════════════════════════════════════════════════════════
    # MAIN RUN
    # ══════════════════════════════════════════════════════════
    def run(self, data: dict) -> dict:
        user_input = data.get("input") or data.get("text") or ""

        if not user_input:
            return {
                "observer": "KING DIADEM",
                "status":   "ERROR",
                "message":  "ไม่พบ input",
            }

        # ── STEP 1: Pattern Analysis ──────────────────────────
        pattern = analyze_pattern(data)
        route   = pattern.get("route", "general")

        # ── STEP 2: Emptiness Guard ───────────────────────────
        guarded = emptiness_guard(pattern)

        if guarded.get("blocked") and guarded.get("reason") in (
            "CHOICE_COLLAPSE", "KERNEL_IMPORT_FAIL", "invalid_state"
        ):
            return {
                "observer":    "KING DIADEM",
                "route":       "BLOCKED",
                "reason":      guarded.get("reason", "GUARD_BLOCK"),
                "action":      "stabilize",
                "status":      "BLOCKED",
                "ai_response": "ระบบพบปัญหาภายใน กรุณาลองใหม่อีกครั้งครับ",
                "risk_score":  guarded.get("risk_score", 0),
                "persona":     "LYLA",
                "pattern": {
                    "entropy":   pattern.get("entropy"),
                    "resource":  pattern.get("resource"),
                    "stability": pattern.get("stability"),
                },
            }

        if guarded.get("emotional_flag") or guarded.get("suggested_route") == "vega":
            route = "vega"
        elif guarded.get("forced_action") == "stabilize":
            if route not in ("survival", "collapse", "vega"):
                route = "survival"

        # ── STEP 3: Persona / Voice Mode ─────────────────────
        raw_vm = str(data.get("voice_mode") or "lyla").lower()
        if   route == "crisis" or raw_vm == "crisis": voice_mode = "crisis"
        elif route == "vega"   or raw_vm == "vega":   voice_mode = "vega"
        else:                                          voice_mode = "lyla"

        persona = "VEGA" if voice_mode == "vega" else "LYLA"

        # ── STEP 4: Core Loop ─────────────────────────────────
        core_result = None
        if self.core_loop:
            try:
                core_result = self.core_loop({
                    "entropy":   pattern.get("entropy",   40),
                    "resource":  pattern.get("resource",  50),
                    "stability": pattern.get("stability", 60),
                    "drift":     0,
                })
                if core_result.get("status") == "HALT" and route != "vega":
                    route = "survival"
            except Exception:
                pass

        # ── STEP 5: UDOK v2.0 — paticcasamuppada ─────────────
        # คืน: root_cause, feeling_tone, kill_zone, uap,
        #       nirvana_mode, collapse_chain, summary
        paticca_result = None
        if self.paticca:
            try:
                paticca_result = self.paticca(pattern)
            except Exception:
                pass

        # ถ้า nirvana_mode (chain ดับที่เวทนา) → ลด route ลงเป็น stable
        if paticca_result:
            if paticca_result.get("nirvana_mode") and route not in ("collapse", "crisis", "vega"):
                route = "stable" if route != "survival" else route

            # ถ้า UAP บอกหยุด + craving สูง → อย่า push ตัดสินใจทันที
            uap = paticca_result.get("uap", {})
            if uap.get("should_pause") and route == "general":
                route = "uncertain"

        # ── STEP 6: Engine Router ─────────────────────────────
        # router รับ pattern + paticca context → คืน route, action,
        # consensus, simulation, strategy, survival
        router_result = None
        if self.router:
            try:
                router_payload = {
                    **pattern,
                    "input":      user_input,
                    "voice_mode": voice_mode,
                    "route_hint": route,          # hint จาก step ก่อน
                    "paticca":    paticca_result, # ส่ง paticca ให้ router ใช้
                }
                router_result = self.router(router_payload)

                # router อาจ override route ถ้า collapse/risk ชัดเจน
                if router_result and router_result.get("route") not in (None, "error"):
                    # ยกเว้น vega/crisis — persona สำคัญกว่า
                    if voice_mode not in ("vega", "crisis"):
                        route = router_result["route"]
            except Exception as e:
                router_result = {"error": f"router fail: {e}"}
        else:
            # fallback: ใช้ _run_route เดิม
            router_result = self._run_route(route, pattern)

        # ── STEP 7: LLM (Gemini) ──────────────────────────────
        ai_response = None
        if self.llm:
            try:
                context_parts = [
                    f"Route: {route}",
                    f"Entropy: {pattern.get('entropy')}",
                    f"Resource: {pattern.get('resource')}",
                    f"Stability: {pattern.get('stability')}",
                ]

                if guarded.get("emotional_flag"):
                    context_parts.append("EMOTIONAL_FLAG: true — ผู้ใช้อาจอยู่ในสถานการณ์ยาก")

                if paticca_result:
                    root    = paticca_result.get("root_cause", "")
                    feeling = paticca_result.get("feeling_tone", "")
                    nirvana = paticca_result.get("nirvana_mode", False)
                    kz_out  = paticca_result.get("kill_zone", {}).get("outcome", "")
                    uap_note = paticca_result.get("uap", {}).get("audit_note", "")

                    if root:    context_parts.append(f"ปฏิจสมุปบาท root: {root}")
                    if feeling: context_parts.append(f"เวทนา: {feeling}")
                    if nirvana: context_parts.append("nirvana_mode: chain ดับที่เวทนา")
                    elif kz_out:context_parts.append(f"kill_zone: {kz_out}")
                    if uap_note:context_parts.append(f"UAP: {uap_note}")

                if router_result:
                    action = router_result.get("action", "")
                    if action:
                        context_parts.append(f"Router action: {action}")

                ai_response = self.llm.generate_with_governance(
                    prompt             = user_input,
                    additional_context = " | ".join(context_parts),
                    history            = data.get("history", []),
                    route              = route,
                    voice_mode         = voice_mode,
                )
            except Exception as e:
                ai_response = f"[Gemini unavailable: {e}]"

        # ── STEP 8: LYLA Observation ──────────────────────────
        lyla_note = None
        if self.lyla:
            try:
                lyla_note = self.lyla.observe(user_input)
            except Exception:
                pass

        # ── OUTPUT ────────────────────────────────────────────
        return {
            "observer":   "KING DIADEM — Decision Engine · กลางทุกสรรพสิ่ง",
            "status":     "SUCCESS",
            "route":      route,
            "persona":    persona,
            "voice_mode": voice_mode,
            "input":      user_input,
            "pattern": {
                "entropy":    pattern.get("entropy"),
                "resource":   pattern.get("resource"),
                "stability":  pattern.get("stability"),
                "confidence": pattern.get("confidence"),
                "warnings":   pattern.get("warnings", []),
            },
            # paticca — UDOK v2.0 (เวทนา, kill_zone, UAP, nirvana)
            "collapse_chain":  paticca_result,
            # router — consensus, simulation, strategy, survival
            "engine_result":   router_result,
            # LLM
            "ai_response":     ai_response,
            # core + lyla
            "core_loop":       core_result,
            "lyla":            lyla_note,
            # guard
            "risk_score":      guarded.get("risk_score", 0),
            "emotional_flag":  guarded.get("emotional_flag", False),
        }

    # ── Fallback route (ถ้า engine_router ไม่โหลด) ───────────
    def _run_route(self, route: str, pattern: dict) -> dict:
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
            elif route in ("vega", "stable"):
                return {"route": route, "status": "pass_to_llm"}
            else:
                from ENGINE.strategy_planner import plan
                return plan(pattern)
        except Exception as e:
            return {"error": f"ENGINE ROUTE FAIL [{route}]: {str(e)}"}


# ══════════════════════════════════════════════════════════════
# SINGLETON + PUBLIC API
# ══════════════════════════════════════════════════════════════
_ENGINE_SINGLETON = None

def _engine() -> DecisionEngine:
    global _ENGINE_SINGLETON
    if _ENGINE_SINGLETON is None:
        _ENGINE_SINGLETON = DecisionEngine()
    return _ENGINE_SINGLETON


def _build_payload(data: dict) -> dict:
    out  = dict(data) if isinstance(data, dict) else {}
    text = str(
        out.get("input") or out.get("text") or
        out.get("question") or ""
    ).strip()

    if not text:
        parts = []
        for k, label in [
            ("location", "ที่ตั้ง"), ("food", "อาหาร"),
            ("money",    "เงิน"),    ("risk", "ความเสี่ยง"),
        ]:
            v = out.get(k)
            if v not in (None, "", "unknown"):
                parts.append(f"{label}: {v}")
        text = " | ".join(parts)
    out["input"] = text

    if "money" in out:
        try:
            m = abs(float(out["money"]))
            out.setdefault("resource", max(5.0, min(95.0, 100.0 - min(m, 99.0))))
        except (TypeError, ValueError):
            pass

    risk_s = str(out.get("risk", "")).lower()
    if any(w in risk_s for w in ["high", "สูง", "critical"]):
        try:
            out["entropy"] = min(95.0, float(out.get("entropy", 40)) + 20.0)
        except (TypeError, ValueError):
            out["entropy"] = 65.0

    return out


def eternal_snapshot_for_decision(state: dict) -> dict:
    try:
        from ENGINE.eternal_runtime import eternal_snapshot
        return eternal_snapshot(state)
    except Exception as e:
        return {"error": str(e)}


def run_decision(data) -> dict:
    if not isinstance(data, dict):
        data = {"input": str(data)}

    merged = _build_payload(data)
    if not (merged.get("input") or "").strip():
        return {
            "observer": "KING DIADEM",
            "status":   "ERROR",
            "message":  "ไม่พบ input",
        }

    # Eternal snapshot
    merged["_eternal_snapshot"] = eternal_snapshot_for_decision({
        "entropy":   float(merged.get("entropy",   40)),
        "resource":  float(merged.get("resource",  50)),
        "stability": float(merged.get("stability", 60)),
    })

    # Self-learning patterns
    try:
        from ENGINE.self_learning import analyze_patterns
        merged["_learning_patterns"] = analyze_patterns()
    except Exception:
        merged["_learning_patterns"] = None

    # Human engine
    try:
        from ENGINE.human_engine import analyze_human
        merged["_human_engine"] = analyze_human(
            {"state": merged.get("input", ""), "context": merged.get("intent")}
        )
    except Exception:
        merged["_human_engine"] = None

    return _engine().run(merged)


def decide(input=None, intent=None, risk=None, **kwargs) -> dict:
    chunks = []
    if input  is not None:
        chunks.append(str(input))
    if intent is not None:
        chunks.append("บริบท: " + (
            json.dumps(intent, ensure_ascii=False)
            if isinstance(intent, dict) else str(intent)
        ))
    if risk is not None:
        chunks.append("ความเสี่ยง: " + (
            json.dumps(risk, ensure_ascii=False)
            if isinstance(risk, dict) else str(risk)
        ))
    for k, v in kwargs.items():
        if v is not None:
            chunks.append(f"{k}: {v}")
    return run_decision({"input": "\n".join(chunks).strip()})


def generate_choices(location, food, money, risk) -> list:
    body = {"input": (
        f"เสนอทางเลือก 3–5 ข้อ สั้น กระชับ "
        f"บริบท: ที่ตั้ง {location} อาหาร {food} เงิน {money} ความเสี่ยง {risk}"
    )}
    out = run_decision(body)
    ai  = out.get("ai_response") or ""
    lines = [
        re.sub(r"^[\d\.\)\-\*•]+\s*", "", s.strip())
        for s in str(ai).splitlines()
        if len(s.strip()) > 3
    ]
    if len(lines) >= 3:
        return lines[:10]
    return [
        "แยกปัญหาเป็น วันนี้ / สัปดาห์นี้ / เดือนนี้ แล้วทำแค่วันนี้ก่อน",
        "หาตัวเลขขั้นต่ำที่ต้องมี แล้วลดรายจ่ายอื่นชั่วคราว",
        "ถ้าเสี่ยงสูง อย่าตัดสินใจถาวรวันนี้ เลือกแค่ปลอดภัยชั่วคราว",
        "ติดต่อคนที่ไว้ใจได้หนึ่งคน ขอให้ช่วยฟังหรือช่วยคิด",
    ]


def decision_intelligence(state: dict, risk: dict) -> dict:
    state = state if isinstance(state, dict) else {}
    risk  = risk  if isinstance(risk,  dict) else {}
    level = str(risk.get("level", "MEDIUM")).upper()

    try:    score = float(risk.get("risk_score", 0))
    except: score = 0.0
    try:    res   = float(state.get("resource",  50))
    except: res   = 50.0
    try:    stab  = float(state.get("stability", 60))
    except: stab  = 60.0

    if level == "CRITICAL" or score >= 85 or res <= 10:
        return {"action": "stabilize",        "message": "ชะลอการตัดสินใจใหญ่ — ดูแลพื้นฐานก่อน"}
    if level == "HIGH"     or score >= 60 or stab < 35:
        return {"action": "stabilize",        "message": "แยกปัญหาเป็นขั้นเล็กๆ แล้วทำทีละขั้น"}
    if res < 30:
        return {"action": "recover_resource", "message": "ทรัพยากรต่ำ — เลือกสิ่งจำเป็นก่อน"}
    if stab < 45:
        return {"action": "expand_choices",   "message": "หาทางเลือกเสริม 2–3 แบบก่อนตัดสินใจ"}
    return     {"action": "maintain",         "message": "ไปต่อได้ — รักษาจังหวะพอประมาณ"}
