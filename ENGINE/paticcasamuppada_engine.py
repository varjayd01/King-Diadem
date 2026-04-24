# =========================
# 🧠 KING DIADEM
# Paticcasamuppada Engine (Upgraded)
# Infrastructure of Suffering
# =========================

CHAIN = [
    "ignorance",
    "formations",
    "consciousness",
    "name_form",
    "sense_bases",
    "contact",
    "feeling",
    "craving",
    "clinging",
    "becoming",
    "birth",
    "collapse"
]


# =========================
# 🔁 CORE CHAIN
# =========================
class DependentChain:

    def __init__(self):
        self.chain = CHAIN

    def simulate(self, root_event, intensity=1.0):
        results = []

        for i, step in enumerate(self.chain):
            results.append({
                "stage": step,
                "index": i,
                "triggered_by": root_event,
                "intensity": round(intensity * (i + 1) / len(self.chain), 2)
            })

        return results


# =========================
# 🔍 ROOT DETECTION (ฉลาดขึ้น)
# =========================
def detect_root_cause(context: str):

    if not context:
        return "ignorance"

    text = context.lower()

    mapping = {
        "ignorance": ["ไม่รู้", "ไม่เข้าใจ", "ignorance"],
        "fear": ["กลัว", "fear", "panic"],
        "craving": ["อยาก", "ต้องการ", "desire"],
        "clinging": ["ยึด", "ปล่อยไม่ได้", "cling"],
        "bias": ["ลำเอียง", "bias"],
        "misinformation": ["ข้อมูลผิด", "fake", "misinformation"],
    }

    for root, keywords in mapping.items():
        for k in keywords:
            if k in text:
                return root

    return "ignorance"


# =========================
# ⚠️ SUFFERING INFRASTRUCTURE
# =========================
def suffering_infrastructure(context: str, pattern: dict = None):

    root = detect_root_cause(context)

    engine = DependentChain()

    # 🔥 intensity จาก pattern จริง
    intensity = 1.0
    if pattern:
        entropy = float(pattern.get("entropy", 40))
        stability = float(pattern.get("stability", 60))

        intensity = max(0.5, min(2.0, (entropy / 50) * (100 - stability) / 100))

    chain = engine.simulate(root, intensity=intensity)

    return {
        "root_cause": root,
        "collapse_chain": chain,
        "intensity": intensity
    }


# =========================
# 🔥 ADAPTER (ให้ DecisionEngine เรียกได้)
# =========================
def analyze(pattern: dict):

    try:
        context = pattern.get("input", "")
        return suffering_infrastructure(context, pattern)

    except Exception as e:
        return {"error": f"paticca fail: {str(e)}"}
