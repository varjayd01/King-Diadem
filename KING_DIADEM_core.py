# ============================================================
# KING DIADEM CORE — v2.0
# Author: Nithikorn Bunsrang
# Architecture: UDOK × DriftZero × Silent Canon
#
# Layer 0 Law: Choice(t) >= 1 → collapse = False
# Kernel Law : หยุดที่เวทนา ก่อนมันสร้างตัวตน
# Silent Canon: Preserve choice. Non-interference.
#               Only act when choice approaches zero.
# ============================================================

from ENGINE.situation_analyzer import analyze_situation
from ENGINE.human_state_engine import analyze_human_state
from ENGINE.collapse_predictor import predict_collapse
from ENGINE.escape_routes import find_escape_routes
from ENGINE.path_generator import generate_paths
from ENGINE.intervention_engine import intervention
from ENGINE.decision_engine import run_decision
from ENGINE.risk_engine import assess_risk
from ENGINE.drift_monitor import detect_drift          # จับการเบี่ยงเบน
from ENGINE.energy_governor import check_energy        # รันได้แม้ทรัพยากรน้อย

from core.emptiness_guard import emptiness_guard       # ไม่ยึด ไม่ปรุงแต่ง
from core.silent_canon import SILENT_CANON             # กฎแกนที่ไม่เปลี่ยน
from core.drift_monitor import log_drift_event
from core.reality_laws import validate_against_reality

from SIMULATIONS.collapse_predictor import CollapseSignal
from WORLD_MODEL.survival_threshold import SurvivalThreshold


# ─────────────────────────────────────────────
# LAYER 0: PRE-KERNEL CHECK
# ก่อนทำอะไร — ตรวจสอบความเป็นจริงก่อนเสมอ
# ─────────────────────────────────────────────

def _layer0_check(question: str) -> dict:
    """
    Evidence-first · Downside-first
    ถ้าความจริงยังไม่ชัด ไม่ประมวลผลต่อ
    """
    reality = validate_against_reality(question)
    energy = check_energy()

    return {
        "reality_verified": reality.get("valid", False),
        "energy_level": energy.get("level", "low"),
        "proceed": reality.get("valid", False)
    }


# ─────────────────────────────────────────────
# KERNEL: CAUSAL INTERRUPT
# หยุดที่เวทนา → ก่อนมันกลายเป็นตัณหา → ก่อนมันกลายเป็นตัวตน
# (UDOK Kill Zone: เวทนา → ตัณหา)
# ─────────────────────────────────────────────

def _kernel_interrupt(human_state: dict) -> dict:
    """
    ตรวจ feeling tone
    ถ้า craving ถูก detect → pause → re-evaluate
    ไม่ให้ระบบ act จาก identity ที่ปรุงแต่ง
    """
    feeling = human_state.get("feeling_tone", "neutral")
    craving = human_state.get("craving_signal", False)

    if craving:
        human_state["kernel_flag"] = "CRAVING_DETECTED — pause before act"
        human_state["recommended_action"] = "re-evaluate from fact layer"
    else:
        human_state["kernel_flag"] = "CLEAR"

    # ไม่ยึดกับ state เดิม
    human_state = emptiness_guard(human_state)

    return human_state


# ─────────────────────────────────────────────
# DRIFT MONITOR
# จับการเบี่ยงเบนก่อนที่จะกลายเป็น collapse
# ─────────────────────────────────────────────

def _monitor_drift(human_state: dict, situation: dict) -> dict:
    drift = detect_drift(human_state, situation)

    if drift.get("drifting"):
        log_drift_event(drift)
        human_state["drift_warning"] = drift.get("signal", "UNKNOWN")
        human_state["drift_severity"] = drift.get("severity", 0)
    else:
        human_state["drift_warning"] = None

    return human_state


# ─────────────────────────────────────────────
# CHOICE GUARD — Layer 0 Law
# ถ้า Choice(t) < 1 → ระบบต้อง intervene
# ─────────────────────────────────────────────

def _choice_guard(paths: list, collapse_risk: dict) -> dict:
    choice_count = len([p for p in paths if p.get("viable")])
    threshold = SurvivalThreshold.MINIMUM_CHOICES  # default: 1

    status = {
        "choice_count": choice_count,
        "below_threshold": choice_count < threshold,
        "law": SILENT_CANON["law"],
        "intervention_required": False
    }

    if status["below_threshold"]:
        status["intervention_required"] = True
        status["alert"] = f"⚠️ Choice(t) = {choice_count} — collapse imminent"

    return status


# ─────────────────────────────────────────────
# MAIN CORE FUNCTION
# ─────────────────────────────────────────────

def king_diadem(question: str) -> dict:
    """
    KING DIADEM Core Runtime
    ไม่ optimize outcome — แต่ preserve choice
    ไม่สั่ง — แต่ส่องให้เห็นทางก่อนมันหาย
    """

    # ── PRE-KERNEL ─────────────────────────────
    layer0 = _layer0_check(question)
    if not layer0["proceed"]:
        return {
            "status": "BLOCKED",
            "reason": "Reality check failed — cannot proceed without verified input",
            "layer0": layer0
        }

    # ── SITUATION ──────────────────────────────
    situation = analyze_situation(question)

    # ── HUMAN STATE ────────────────────────────
    human_state = analyze_human_state(question)
    human_state = _kernel_interrupt(human_state)   # UDOK Kill Zone
    human_state = _monitor_drift(human_state, situation)

    # ── RISK & COLLAPSE ────────────────────────
    risk = assess_risk(human_state, situation)
    collapse_signal: CollapseSignal = predict_collapse(human_state)

    # ── PATHS ──────────────────────────────────
    paths = generate_paths(human_state)
    escape = find_escape_routes(human_state, situation)

    # ── CHOICE GUARD ───────────────────────────
    choice_status = _choice_guard(paths, collapse_signal)

    # ── INTERVENTION (only if choice → 0) ─────
    help_plan = None
    if choice_status["intervention_required"]:
        help_plan = intervention(paths, escape)

    # ── DECISION ───────────────────────────────
    decision = run_decision({
        "location": situation.get("location", "unknown"),
        "food":     situation.get("food", "medium"),
        "money":    situation.get("money", 0),
        "risk":     risk.get("level", "medium"),
        "choice_count": choice_status["choice_count"]
    })

    # ── OUTPUT ─────────────────────────────────
    return {
        "kernel_status":    human_state.get("kernel_flag"),
        "drift_warning":    human_state.get("drift_warning"),
        "situation":        situation,
        "human_state":      human_state,
        "risk":             risk,
        "collapse_signal":  collapse_signal,
        "choice_status":    choice_status,
        "paths":            paths,
        "escape_routes":    escape,
        "intervention":     help_plan,
        "decision":         decision,
        "canon":            SILENT_CANON
    }
