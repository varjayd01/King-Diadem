# core/system_orchestrator.py
"""
KING DIADEM — System Orchestrator v3.0
เพิ่ม: paticcasamuppada · persona (LYLA/VEGA) · consensus · cosmic_latte · living_water
"""
from typing import Dict, Any, Optional


class SystemOrchestrator:

    def route(self, user_input: str, voice_mode: str = "lyla") -> str:
        t = (user_input or "").lower()

        crisis_kw   = ["อยากตาย","ไม่อยากอยู่","ฆ่าตัว","จบชีวิต","suicid"]
        emotion_kw  = ["เครียด","ท้อ","เสียใจ","หมดหวัง","เหนื่อย","กลัว","ร้องไห้","โดดเดี่ยว"]
        survival_kw = ["ไม่มีกิน","ไม่มีเงิน","หิว","หมดเงิน","ไม่มีที่อยู่","ถูกไล่ออก","ตกงาน","จน","หนี้"]
        risk_kw     = ["เสี่ยง","อันตราย","ล้มละลาย","พัง","collapse","ขาดทุน","เจ๊ง"]
        rel_kw      = ["แฟน","เลิก","ทะเลาะ","ครอบครัว","พ่อ","แม่","ความสัมพันธ์","เพื่อน"]
        biz_kw      = ["ธุรกิจ","บริษัท","งาน","ลูกค้า","โปรเจกต์","เจ้านาย","ลาออก"]
        vega_kw     = ["ระยะยาว","อนาคต","กลยุทธ์","strategic","วิเคราะห์ระบบ","ภาพรวม"]

        if any(w in t for w in crisis_kw) or voice_mode == "crisis":
            return "crisis"
        if any(w in t for w in vega_kw) or voice_mode == "vega":
            return "vega"
        if any(w in t for w in emotion_kw):
            return "vega"       # emotion → VEGA รับ แต่ยังเป็น lyla tone
        if any(w in t for w in survival_kw):
            return "survival"
        if any(w in t for w in risk_kw):
            return "risk"
        if any(w in t for w in rel_kw):
            return "relationship"
        if any(w in t for w in biz_kw):
            return "civil"
        return "general"

    def _resolve_persona(self, route: str, voice_mode: str) -> str:
        """LYLA = หญิง/ค่ะ · VEGA = ชาย/ครับ · crisis → LYLA"""
        if voice_mode == "crisis" or route == "crisis":
            return "lyla"
        if voice_mode == "vega" or route == "vega":
            return "vega"
        return "lyla"

    def _paticcasamuppada(self, text: str) -> str:
        """ปฏิจสมุปบาท — วิเคราะห์ลูกโซ่เหตุปัจจัย"""
        try:
            from ENGINE.paticcasamuppada_engine import analyze_chain
            r = analyze_chain(text)
            if isinstance(r, dict):
                root = r.get("root_cause", "")
                down = r.get("downstream", "")
                if root:
                    return f"[ปฏิจสมุปบาท — ต้นเหตุ: {root} | ผลที่จะตามมา: {down}]"
        except Exception:
            pass
        # fallback hint — โยนิโสมนสิการ
        return "[โยนิโสมนสิการ: วิเคราะห์ต้นเหตุและลูกโซ่ผลกระทบก่อนตอบ]"

    def _cosmic_latte(self, text: str) -> str:
        """สุญยตา context จาก cosmic_latte kernel"""
        try:
            from AI_KERNEL.cosmic_latte import get_context
            r = get_context(text)
            return f"[COSMIC_LATTE] {r}" if r else ""
        except Exception:
            return ""

    def _living_water(self, text: str) -> bool:
        """ตรวจ emotional/crisis leak"""
        try:
            from AI_KERNEL.living_water import detect_leak
            return detect_leak(text)
        except Exception:
            return False

    def execute(self, route: str, data: Dict[str, Any]) -> Dict[str, Any]:
        user_input = data.get("input", "")
        context    = data.get("context", {})
        voice_mode = data.get("voice_mode", "lyla")
        persona    = self._resolve_persona(route, voice_mode)

        result = {
            "route":            route,
            "persona":          persona.upper(),
            "voice_mode":       persona,
            "context_for_lyla": "",
            "pattern":          {"entropy": 40, "stability": 60, "resource": 50},
            "risk_score":       10.0,
            "can_decide":       True,
            "waterline":        70.0,
            "flags":            [],
            "ai_response":      None,
        }

        ctx_parts = []

        # ── 1. ปฏิจสมุปบาท (ทุก route) ──────────────────────────
        paticca = self._paticcasamuppada(user_input)
        if paticca:
            ctx_parts.append(paticca)

        # ── 2. สุญยตา / cosmic latte ─────────────────────────────
        latte = self._cosmic_latte(user_input)
        if latte:
            ctx_parts.append(latte)

        # ── 3. Living water — emotional flag ─────────────────────
        if self._living_water(user_input) and route not in ("crisis", "vega"):
            ctx_parts.append("[LIVING_WATER: emotional signal detected — รับรู้ก่อนวิเคราะห์]")

        # ── 4. RealHuman SurvivorEngine ──────────────────────────
        try:
            from ENGINE.realhuman_survivorengine import (
                RealHumanSurvivorEngine, parse_state_from_context
            )
            h_state  = parse_state_from_context(context)
            survival = RealHumanSurvivorEngine().run(h_state)
            result["waterline"]  = survival.waterline
            result["can_decide"] = survival.can_decide
            result["flags"]      = survival.flags
            if survival.context_for_lyla:
                ctx_parts.append(survival.context_for_lyla)
        except Exception as e:
            ctx_parts.append(f"[SURVIVOR_SKIP: {e}]")

        # ── 5. Route-specific engines ─────────────────────────────
        if route == "survival":
            try:
                from ENGINE.survival_advisor import advise
                r = advise(data)
                if r:
                    ctx_parts.append(f"[SURVIVAL] {r}")
            except Exception as e:
                ctx_parts.append(f"[SURVIVAL_SKIP: {e}]")

        elif route == "risk":
            try:
                from ENGINE.risk_engine import assess_risk
                state = context.get("state", {})
                r = assess_risk(
                    state.get("energy", 50),
                    state.get("food", True),
                    state.get("safe_place", True)
                )
                if r:
                    ctx_parts.append(f"[RISK] {r}")
                from ENGINE.collapse_predictor import CollapsePredictor
                col = CollapsePredictor().predict(user_input, context)
                if isinstance(col, dict) and col.get("chain"):
                    ctx_parts.append(f"[COLLAPSE_CHAIN] {col['chain']}")
            except Exception as e:
                ctx_parts.append(f"[RISK_SKIP: {e}]")

        elif route in ("vega", "crisis"):
            try:
                from core.vega_mode import vega_mode_hint
                hint = vega_mode_hint(user_input)
                if hint:
                    ctx_parts.append(hint)
            except Exception:
                if route == "vega":
                    ctx_parts.append("[VEGA: strategic analysis — มองภาพใหญ่ระยะยาว]")

        elif route == "relationship":
            ctx_parts.append("[RELATIONSHIP] เรื่องความสัมพันธ์ — ฟังก่อน ไม่ตัดสิน")

        elif route == "civil":
            try:
                from ENGINE.strategy_planner import StrategyPlanner
                strat = StrategyPlanner().plan(user_input, context)
                if isinstance(strat, dict) and strat.get("options"):
                    opts = strat["options"][:3]
                    ctx_parts.append(f"[STRATEGY] {' | '.join(str(o) for o in opts)}")
            except Exception as e:
                ctx_parts.append(f"[STRATEGY_SKIP: {e}]")

        else:
            try:
                from ENGINE.pattern_engine import detect_pattern
                pat = detect_pattern(user_input)
                if isinstance(pat, dict):
                    result["pattern"].update({k: v for k, v in pat.items() if v is not None})
            except Exception:
                pass

        # ── 6. Parables (ทุก route) ───────────────────────────────
        try:
            from core.parables import parable_context_note
            p = parable_context_note(user_input)
            if p:
                ctx_parts.append(p)
        except Exception:
            pass

        # ── 7. Escape routes ถ้า risk สูง ────────────────────────
        if result["risk_score"] > 55 or not result["can_decide"]:
            try:
                from ENGINE.escape_routes import assess
                esc = assess(user_input)
                if esc:
                    ctx_parts.append(f"[ESCAPE_ROUTES] {esc}")
            except Exception:
                pass

        result["context_for_lyla"] = "\n".join(p for p in ctx_parts if p)
        return result

    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        user_input = data.get("input", "")
        voice_mode = data.get("voice_mode", "lyla")

        route = data.get("route") or "general"
        if route == "general":
            route = self.route(user_input, voice_mode)

        result  = self.execute(route, data)
        persona = result.get("voice_mode", "lyla")

        # ── LLM call ──────────────────────────────────────────────
        if result.get("ai_response") is None:
            try:
                from core.llm_gemini import GeminiLLM
                llm = GeminiLLM(model="gemini-2.0-flash")
                result["ai_response"] = llm.generate_with_governance(
                    prompt             = user_input,
                    additional_context = result["context_for_lyla"],
                    history            = data.get("history", []),
                    route              = route,
                    voice_mode         = persona,
                )
            except Exception as e:
                result["ai_response"] = f"[LLM Error: {e}]"

        # ── Consensus synthesis ───────────────────────────────────
        if result.get("ai_response"):
            try:
                from ENGINE.consensus_engine import build_consensus
                cs = build_consensus({
                    "text":        user_input,
                    "response":    result["ai_response"],
                    "route":       route,
                    "human_state": result.get("pattern", {}),
                })
                if isinstance(cs, dict) and cs.get("consensus"):
                    result["consensus"] = cs["consensus"]
            except Exception:
                pass

        result["route"]    = route
        result["status"]   = "SUCCESS"
        result["observer"] = "KING DIADEM"
        result["persona"]  = "VEGA" if persona == "vega" else "LYLA"
        result["governance"] = {
            "intent":      {"intent": route, "confidence": 0.8},
            "human_state": result.get("pattern", {}),
        }
        return result

    # backward compat — app.py เดิมเรียก run_with_survivor_engine
    def run_with_survivor_engine(self, user_input: str,
                                  human_context: dict = None) -> Dict[str, Any]:
        return self.run({
            "input":   user_input,
            "context": human_context or {},
        })


_orchestrator: Optional[SystemOrchestrator] = None

def get_orchestrator() -> SystemOrchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = SystemOrchestrator()
    return _orchestrator
