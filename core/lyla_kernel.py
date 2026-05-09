"""
LYLA OPEN SYSTEM CORE LOGIC KERNEL
KING DIADEM DriftZero Waterline Governance OS
Deterministic Audit Standard
Fail less. Harm less. Restore more.
"""

LYLA_KERNEL_VERSION = "1.0"
LYLA_KERNEL_MODE = "OPEN_SYSTEM"
LYLA_KERNEL_AUTHOR = "Nithikorn Bunsrang"
LYLA_KERNEL_SPEC = """
LYLA OPEN SYSTEM CORE LOGIC KERNEL
KING DIADEM DriftZero Waterline Governance OS
Deterministic Audit Standard
Fail less. Harm less. Restore more.
---
SYSTEM ACTIVATION
Command: LYLA = Open System Mode
Operator stance: Ego OFF | Narrative OFF | Evidence ON | Survivability ON
Goal: Restore ≥1 real safe option.
---
CORE PRINCIPLE
REALITY - OPTIMIZATION = GOVERNANCE
---
REALITY CONSTRAINTS
R0.1 Impermanence — Nothing is permanent.
R0.2 Dependency Fragility — Optimization addiction increases fragility.
R0.3 Non-Ownership of Truth — Truth has no owner.
---
DRIFTZERO
Collapse = 0.1% drift per day accumulating.
Metric: Daily Harm Delta (DHD)
Rule: Measure drift, not narrative.
---
WATERLINE
Waterline = survival floor. Treat. Trace. Or Stop.
---
GOVERNANCE RULES
1. Authority without evidence is invalid.
2. Stabilize before optimize.
3. Any operator may Stop-the-Line.
4. Self-dealing requires recusal.
5. Narrative without audit = distortion.
---
FINAL LOCK
A system survives not by growth,
but by refusing to increase collapse.
Fail less. Harm less. Restore more.
"""

LYLA_KERNEL = LYLA_KERNEL_SPEC


def get_lyla_kernel():
    return {
        "name": "LYLA Kernel",
        "version": LYLA_KERNEL_VERSION,
        "mode": LYLA_KERNEL_MODE,
        "author": LYLA_KERNEL_AUTHOR,
        "kernel": LYLA_KERNEL_SPEC
    }


class LylaKernel:
    """
    LYLA Kernel instance — governance observation layer.
    Connects DriftZero waterline logic + Cosmic Latte universal framework.
    Fail less. Harm less. Restore more.
    """

    def observe(self, text: str) -> dict:
        text_lower = text.lower()

        collapse_kw = ["พัง", "ล้ม", "หมด", "collapse", "crisis", "ไม่มีทาง", "สิ้นหวัง"]
        drift_kw    = ["ไม่แน่ใจ", "กลัว", "confused", "stuck", "drift", "เสื่อม", "ถดถอย", "หนัก"]
        stable_kw   = ["มั่นคง", "stable", "ok", "ดี", "ปกติ", "fine", "พร้อม"]
        harm_kw     = ["เจ็บ", "เสียหาย", "harm", "hurt", "ทำลาย", "สูญเสีย"]

        # ── WATERLINE DETECTION ──────────────────────────────────
        if any(k in text_lower for k in collapse_kw):
            stability = "CRITICAL"
            waterline = "BREACHED"
            note = "Choice collapse risk detected. Stop-the-Line authority activated. Restore ≥1 safe option immediately."
            action = "INTERVENE"

        elif any(k in text_lower for k in harm_kw):
            stability = "HARM_SIGNAL"
            waterline = "AT_RISK"
            note = "Harm signal detected. Audit evidence before proceeding. Ego OFF."
            action = "AUDIT"

        elif any(k in text_lower for k in drift_kw):
            stability = "DRIFTING"
            waterline = "DECLINING"
            note = "Drift accumulating. Measure daily harm delta. Do not optimize on broken floor."
            action = "MONITOR"

        elif any(k in text_lower for k in stable_kw):
            stability = "STABLE"
            waterline = "ABOVE_LINE"
            note = "System stable. Continue with evidence-based governance."
            action = "MAINTAIN"

        else:
            stability = "NOMINAL"
            waterline = "NOMINAL"
            note = "No critical signals. Silence = alignment preserved."
            action = "OBSERVE"

        return {
            "kernel": "LYLA",
            "version": LYLA_KERNEL_VERSION,
            "stability": stability,
            "waterline": waterline,
            "observation": note,
            "action": action,
            "mode": LYLA_KERNEL_MODE,
            "law": "Fail less. Harm less. Restore more.",
        }
