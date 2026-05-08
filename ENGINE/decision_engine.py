
# =========================
# 👑 ENGINE/decision_engine.py
# เชื่อม Gemini + LYLA + Paticcasamuppada + EmptinessGuard
# จำลองอนาคตหลายเส้นทาง — กลางทุกสรรพสิ่ง
# =========================

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
