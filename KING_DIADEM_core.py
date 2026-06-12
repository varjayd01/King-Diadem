# ============================================================
# KING DIADEM CORE — v2.1  (bug-fix patch)
# Author: Nithikorn Bunsrang
# Architecture: UDOK × DriftZero × Silent Canon
#
# Layer 0 Law: Choice(t) >= 1 → collapse = False
# Kernel Law : หยุดที่เวทนา ก่อนมันสร้างตัวตน
# Silent Canon: Preserve choice. Non-interference.
#               Only act when choice approaches zero.
#
# --- PATCH v2.1 ---
# FIX 1: SurvivalThreshold — ย้าย import ให้ตรง path จริง
#         (WORLD_MODEL ไม่มีใน project → ใช้ core.survival_threshold)
# FIX 2: predict_collapse() — ส่ง risk_score (float) แทน human_state (dict)
# FIX 3: generate_paths() — ส่ง lat/lng แทน dict, เพิ่ม "viable" key
# ============================================================

from ENGINE.situation_analyzer import analyze_situation
from ENGINE.human_state_engine import analyze_human_state
from ENGINE.collapse_predictor import predict_collapse
from ENGINE.escape_routes import find_escape_routes
from ENGINE.path_generator import generate_paths
from ENGINE.intervention_engine import intervention
from ENGINE.decision_engine import run_decision
from ENGINE.risk_engine import assess_risk
from ENGINE.drift_monitor import detect_drift
from ENGINE.energy_governor import check_energy

from core.emptiness_guard import emptiness_guard
from core.silent_canon import SILENT_CANON
from core.drift_monitor import log_drift_event
from core.reality_laws import validate_against_reality

from SIMULATIONS.collapse_predictor import CollapseSignal

# ─── FIX 1 ────────────────────────────────────────────────
# เดิม: from WORLD_MODEL.survival_threshold import SurvivalThreshold
# WORLD_MODEL ไม่ได้อยู่ใน project structure จริง
# ย้ายมาที่ core/ ซึ่งเป็น pattern ที่ใช้ตลอดทั้งไฟล์
# ถ้า survival_threshold ยังไม่มีใน core/ → สร้างไฟล์นั้นก่อน
# หรือถ้าอยู่ที่ path อื่น ให้แก้ import บรรทัดนี้ตาม path จริง
from core.survival_threshold import SurvivalThreshold
# ──────────────────────────────────────────────────────────


# ─────────────────────────────────────────────
# LAYER 0: PRE-KERNEL CHECK
# ─────────────────────────────────────────────

def _layer0_check(question: str) -> dict:
    reality = validate_against_reality(question)
    energy = check_energy()
    return {
        "reality_verified": reality.get("valid", False),
        "energy_level": energy.get("level", "low"),
        "proceed": reality.get("valid", False)
    }


# ─────────────────────────────────────────────
# KERNEL: CAUSAL INTERRUPT
# ─────────────────────────────────────────────

def _kernel_interrupt(human_state: dict) -> dict:
    craving = human_state.get("craving_signal", False)
    if craving:
        human_state["kernel_flag"] = "CRAVING_DETECTED — pause before act"
        human_state["recommended_action"] = "re-evaluate from fact layer"
    else:
        human_state["kernel_flag"] = "CLEAR"
    human_state = emptiness_guard(human_state)
    return human_state


# ─────────────────────────────────────────────
# DRIFT MONITOR
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
# ─────────────────────────────────────────────

def _choice_guard(paths: list, collapse_risk: dict) -> dict:
    # ─── FIX 3 (ส่วนที่ 2) ───────────────────────────────────
    # เดิม: p.get("viable") → generate_paths() ไม่เคย return key นี้
    # path object มี keys: "type", "target", "viable" (หลัง patch path_generator)
    # filter เฉพาะ path ที่ viable=True จริง ๆ
    choice_count = len([p for p in paths if p.get("viable") is True])
    # ─────────────────────────────────────────────────────────

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
    human_state = _kernel_interrupt(human_state)
    human_state = _monitor_drift(human_state, situation)

    # ── RISK & COLLAPSE ────────────────────────
    risk = assess_risk(human_state, situation)

    # ─── FIX 2 ────────────────────────────────
    # เดิม: predict_collapse(human_state)
    #   → ส่ง dict เข้าไป แต่ function รับ float
    #   → _clamp() จับ exception แล้ว return 0.0
    #   → risk_score = 0 ตลอด → collapse_level = "LOW" ผิด ๆ
    #
    # แก้: ดึง risk_score (float) จาก risk dict ก่อนส่ง
    risk_score_value: float = float(risk.get("risk_score", 40))  # key จาก risk_engine.py
    collapse_signal: CollapseSignal = predict_collapse(risk_score_value)
    # ──────────────────────────────────────────

    # ── PATHS ──────────────────────────────────
    # ─── FIX 3 (ส่วนที่ 1) ───────────────────────────────────
    # เดิม: generate_paths(human_state)
    #   → ส่ง dict แต่ function รับ (lat, lng)
    #   → TypeError crash หรือ lat/lng เป็น dict → routes ผิดหมด
    #   → path objects ไม่มี key "viable" → choice_count = 0 ทุกครั้ง
    #
    # แก้: ดึง lat/lng จาก situation ก่อนส่ง
    #      และ generate_paths ต้องคืน "viable" key ด้วย (แก้ใน path_generator.py ด้วย)
    lat = float(situation.get("lat", 0.0))
    lng = float(situation.get("lng", 0.0))
    raw_paths = generate_paths(lat, lng)

    # normalize: เพิ่ม "viable" key ถ้า path_generator ยังไม่มี
    # viable = True ถ้า path มี type และ target ครบ
    paths = [
        {**p, "viable": bool(p.get("type") and p.get("target"))}
        for p in raw_paths
    ]
    # ──────────────────────────────────────────

    escape = find_escape_routes(human_state, situation)

    # ── CHOICE GUARD ───────────────────────────
    choice_status = _choice_guard(paths, collapse_signal)

    # ── INTERVENTION (only if choice → 0) ─────
    help_plan = None
    if choice_status["intervention_required"]:
        help_plan = intervention(paths, escape)

    # ── DECISION ───────────────────────────────
    decision = run_decision({
        "location":     situation.get("location", "unknown"),
        "food":         situation.get("food", "medium"),
        "money":        situation.get("money", 0),
        "risk":         risk.get("level", "medium"),
        "choice_count": choice_status["choice_count"]
    })

    # ── OUTPUT ─────────────────────────────────
    return {
        "kernel_status":   human_state.get("kernel_flag"),
        "drift_warning":   human_state.get("drift_warning"),
        "situation":       situation,
        "human_state":     human_state,
        "risk":            risk,
        "collapse_signal": collapse_signal,
        "choice_status":   choice_status,
        "paths":           paths,
        "escape_routes":   escape,
        "intervention":    help_plan,
        "decision":        decision,
        "canon":           SILENT_CANON
    }
