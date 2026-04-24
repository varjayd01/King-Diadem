from typing import Dict, Any

# 🔗 SAFE IMPORT (กันพังทุกตัว)
try:
    from ENGINE.risk_engine import analyze_risk
except:
    analyze_risk = None

try:
    from ENGINE.pattern_engine import detect_pattern
except:
    detect_pattern = None

try:
    from ENGINE.council_engine import council_review
except:
    council_review = None

try:
    from core.trust_system import evaluate as trust_evaluate
except:
    trust_evaluate = None


class DecisionEngine:

    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:

        user_input = data.get("input", "")
        state = data.get("state", {})

        # ------------------------
        # 🧠 PHASE 1: RISK (แกนหลัก)
        # ------------------------
        risk_data = self._get_risk(state)
        risk_level = risk_data.get("level", "UNKNOWN")

        # ------------------------
        # 🧠 PHASE 2: ORCHESTRATION
        # ------------------------
        result = {
            "status": self._status(risk_level),
            "risk": risk_data,
            "choices": [],
            "activated_cores": ["RiskEngine"],
            "pattern": None,
            "trust": None,
            "council": None,
            "meta": {}
        }

        energy = int(state.get("energy", 50))

        # 🔴 HIGH
        if risk_level in ["HIGH", "CRITICAL"] or energy < 15:
            result["activated_cores"] += ["PatternEngine", "TrustCore", "CouncilCore"]

            result["pattern"] = self._safe_pattern(user_input)
            result["trust"] = self._safe_trust()
            result["choices"] = self._generate_choices("HIGH", energy)
            result["council"] = self._safe_council(result)

            result["meta"]["mode"] = "SURVIVAL_MAX"

        # ⚖️ MEDIUM
        elif risk_level in ["MEDIUM", "NORMAL"]:
            result["activated_cores"].append("PatternEngine")

            result["pattern"] = self._safe_pattern(user_input)
            result["choices"] = self._generate_choices("MEDIUM", energy)
            result["trust"] = "STANDBY"
            result["council"] = "STANDBY"

            result["meta"]["mode"] = "BALANCED"

        # ✅ LOW
        else:
            result["choices"] = [
                "ดำเนินการตามปกติ",
                "สังเกตการณ์",
                "เก็บข้อมูลเพิ่ม"
            ]
            result["trust"] = "SAFE"
            result["pattern"] = "NORMAL"
            result["meta"]["mode"] = "STABLE"

        return result

    # ------------------------
    # 🔧 SAFE LAYERS
    # ------------------------

    def _get_risk(self, state):
        try:
            if analyze_risk:
                return analyze_risk(state)
        except:
            pass

        return {
            "level": self._assess_risk_local(state),
            "fallback": True
        }

    def _safe_pattern(self, text):
        try:
            if detect_pattern:
                return detect_pattern(text)
        except:
            pass
        return "UNKNOWN"

    def _safe_trust(self):
        try:
            if trust_evaluate:
                return trust_evaluate()
        except:
            pass
        return "UNVERIFIED"

    def _safe_council(self, data):
        try:
            if council_review:
                return council_review(data)
        except:
            pass
        return "NO_COUNCIL"

    # ------------------------
    # 🔧 LOCAL LOGIC
    # ------------------------

    def _assess_risk_local(self, state):
        energy = int(state.get("energy", 50))
        food = state.get("food", True)
        safe = state.get("safe_place", True)

        if energy < 20 or not food or not safe:
            return "HIGH"

        if energy < 50:
            return "MEDIUM"

        return "LOW"

    def _generate_choices(self, risk, energy):

        if risk == "HIGH":
            return [
                "หยุดการตัดสินใจที่ไม่จำเป็น",
                "ฟื้นฟูพลังงานทันที",
                "ออกจากสภาพแวดล้อมเสี่ยง"
            ]

        if risk == "MEDIUM":
            return [
                "ลดความเสี่ยง",
                "ประเมินทรัพยากรใหม่",
                "ชะลอการตัดสินใจใหญ่"
            ]

        return [
            "ดำเนินการต่อ",
            "สังเกตการณ์",
            "ขยายแบบควบคุม"
        ]

    def _status(self, risk):
        if risk in ["HIGH", "CRITICAL"]:
            return "⚠️ SURVIVAL MODE"
        if risk in ["MEDIUM", "NORMAL"]:
            return "⚖️ LIMITED"
        return "✅ STABLE"
