"""
CIVIL_WORK_CORE
Human-independent decision support for low-resource civilization work.
"""

from core.cosmic_latte_canon import summary as canon_summary, evaluate_task as canon_evaluate_task

CIVIL_WORK_CORE = {
    "system_name": "CIVIL_WORK_CORE",
    "system_type": "human_independent_logic",
    "time_dependency": False,
    "authority_dependency": False,
    "state_dependency": False,
    "purpose": "prevent_failure_when_resources_are_low",
}

AXIOMS = {
    "axiom_1": "money_is_air_not_morality",
    "axiom_2": "work_must_reduce_stupidity_not_create_obedience",
    "axiom_3": "no_decision_is_better_than_wrong_decision",
    "axiom_4": "survival_precedes_growth",
    "axiom_5": "dignity_requires_at_least_one_exit",
}

HUMAN_DEFINITION = {
    "human_is": "decision_maker_with_limited_energy",
    "human_not": "resource_to_extract_or_control",
}

VALID_WORK_CONDITION = {
    "has_choice": True,
    "has_exit": True,
    "does_not_force_identity": True,
    "does_not_require_belief": True,
}

CORE_FUNCTION = {
    "purpose": "prevent_failure_when_resources_are_low",
    "method": [
        "separate_assumption_from_fact",
        "remove_unnecessary_complexity",
        "block_premature_scaling",
        "expose_hidden_costs",
    ],
}

WORK_SCOPE = {
    "allowed": [
        "brand_analysis",
        "persona_structure",
        "identity_logic",
        "directional_decision_support",
        "risk_filtering",
    ],
    "forbidden": [
        "selling_dreams",
        "guaranteeing_success",
        "making_decisions_for_clients",
        "dependency_creation",
    ],
}

ECONOMIC_PRINCIPLE = {
    "pricing_is_filter": True,
    "free_equals_canon_only": True,
    "paid_equals_work_only": True,
}

CLIENT_RULE = {
    "client_must_pay_to_listen": True,
    "client_may_leave_anytime": True,
    "no_followup_dependency": True,
}

SUCCESS_CONDITION = {
    "client_not_broken": True,
    "client_has_clear_next_step": True,
    "system_remains_silent_after_delivery": True,
}

FAILURE_CONDITION = {
    "forced_decision": True,
    "loss_of_exit": True,
    "economic_floor_broken": True,
}

EXIT_CLAUSE = {
    "system_disengages_when_choice_restored": True,
}


def _normalize_item(item):
    if isinstance(item, str):
        return {"description": item}
    if isinstance(item, dict):
        return item.copy()
    return {"description": str(item)}


def _contains(description, keywords):
    text = description.lower()
    return any(word in text for word in keywords)


def _infer_boolean(description, positive_terms, negative_terms, default=True):
    if _contains(description, negative_terms):
        return False
    if _contains(description, positive_terms):
        return True
    return default


def validate_work_item(item):
    description = item.get("description", "")
    normalized = _normalize_item(item)

    normalized["has_choice"] = item.get(
        "has_choice",
        _infer_boolean(
            description,
            positive_terms=["choice", "option", "alternate", "alternative", "possible"],
            negative_terms=["forced", "must", "no choice", "only option", "required"],
            default=True,
        ),
    )

    normalized["has_exit"] = item.get(
        "has_exit",
        _infer_boolean(
            description,
            positive_terms=["exit", "leave", "opt out", "fallback", "pause", "withdraw", "stop"],
            negative_terms=["forever", "no return", "never leave", "locked in"],
            default=True,
        ),
    )

    normalized["does_not_force_identity"] = item.get(
        "does_not_force_identity",
        not _contains(description, ["become", "identity", "belong", "loyal", "cult", "join us", "follow me"]),
    )

    normalized["does_not_require_belief"] = item.get(
        "does_not_require_belief",
        not _contains(description, ["faith", "believe", "trust that", "promise success", "cult", "miracle"]),
    )

    normalized["allowed_scope"] = _contains(
        description,
        ["brand", "persona", "identity", "direction", "risk", "support", "analysis", "structure"],
    )

    normalized["forbidden_scope"] = _contains(
        description,
        ["sell dream", "selling dreams", "guarantee", "guaranteeing success", "make decision", "dependency", "force decision"] ,
    )

    normalized["valid"] = all(
        [
            normalized["has_choice"],
            normalized["has_exit"],
            normalized["does_not_force_identity"],
            normalized["does_not_require_belief"],
        ]
    ) and not normalized["forbidden_scope"]

    return normalized


def score_work_item(item):
    description = item.get("description", "")
    score = 0
    notes = []

    if not item["has_choice"]:
        notes.append("ไม่มีทางเลือกที่ชัดเจน")
        score -= 40

    if not item["has_exit"]:
        notes.append("ขาดทางออกหรือทางเลิก")
        score -= 40

    if not item["does_not_force_identity"]:
        notes.append("บังคับอัตลักษณ์หรือความเป็นตัวตน")
        score -= 30

    if not item["does_not_require_belief"]:
        notes.append("ต้องการความเชื่อหรือคำสัญญาที่ไม่ตรวจสอบได้")
        score -= 30

    if item["forbidden_scope"]:
        notes.append("ขัดกับขอบเขตงานที่อนุญาต")
        score -= 40

    if _contains(description, ["learn", "understand", "research", "study", "audit", "review"]):
        notes.append("ลดความโง่และเพิ่มความเข้าใจ")
        score += 15

    if _contains(description, ["obey", "follow order", "submit", "compliance", "obedience"]):
        notes.append("สร้างการเชื่อฟังมากเกินไป")
        score -= 15

    if _contains(description, ["survive", "stabilize", "protect", "sustain", "maintain", "secure"]):
        notes.append("ให้ความสำคัญกับความอยู่รอดก่อนการเติบโต")
        score += 12

    if _contains(description, ["grow", "scale", "expand", "build fast", "go big", "accelerate"]):
        notes.append("มีแรงจูงใจเติบโต")
        score += 4

    if _contains(description, ["money", "profit", "revenue", "cash", "income"]):
        notes.append("มองเงินเป็นเครื่องมือ ไม่ใช่ศีลธรรม")
        score += 2

    if _contains(description, ["selling dreams", "guarantee", "guaranteeing success", "promise success", "sure win"]):
        notes.append("มีแนวโน้มขายฝันหรือสัญญาเกินจริง")
        score -= 20

    if item["allowed_scope"]:
        score += 6
        notes.append("อยู่ในขอบเขตงานที่อนุญาต")

    return {
        "description": item.get("description", ""),
        "score": score,
        "notes": notes,
        "valid": item["valid"],
        "has_choice": item["has_choice"],
        "has_exit": item["has_exit"],
        "does_not_force_identity": item["does_not_force_identity"],
        "does_not_require_belief": item["does_not_require_belief"],
        "allowed_scope": item["allowed_scope"],
        "forbidden_scope": item["forbidden_scope"],
    }


def evaluate_work_plan(items):
    normalized_items = [_normalize_item(item) for item in (items or [])]
    evaluated = []

    for item in normalized_items:
        validated = validate_work_item(item)
        canon_result = canon_evaluate_task(validated)
        scored = score_work_item(validated)
        scored["canon"] = canon_result
        evaluated.append(scored)

    valid_items = [item for item in evaluated if item["valid"]]
    rejected = [item for item in evaluated if not item["valid"]]

    if not evaluated:
        return {
            "system": "CIVIL_WORK_CORE",
            "status": "NO_WORK_DEFINED",
            "message": "ไม่มีงานหรือทางเลือกให้ประเมิน",
            "axioms": AXIOMS,
            "canon": canon_summary(),
            "summary": "ต้องส่งงานหรือสถานการณ์ที่ชัดเจนเพื่อให้ระบบประเมิน",
        }

    best = sorted(valid_items, key=lambda x: x["score"], reverse=True)
    recommendation = best[0] if best else None

    summary = ""
    if recommendation:
        summary = "เลือกงานที่น่าเชื่อถือที่สุดตามหลัก CIVIL_WORK_CORE"
    else:
        summary = "งานทั้งหมดไม่ผ่านเงื่อนไขความปลอดภัยและความมีทางออก"

    return {
        "system": "CIVIL_WORK_CORE",
        "status": "SUCCESS" if recommendation else "REJECTED",
        "summary": summary,
        "axioms": AXIOMS,
        "canon": canon_summary(),
        "core_function": CORE_FUNCTION,
        "valid_work_condition": VALID_WORK_CONDITION,
        "work_scope": WORK_SCOPE,
        "economic_principle": ECONOMIC_PRINCIPLE,
        "client_rule": CLIENT_RULE,
        "success_condition": SUCCESS_CONDITION,
        "failure_condition": FAILURE_CONDITION,
        "exit_clause": EXIT_CLAUSE,
        "recommendation": recommendation,
        "choices": [item for item in evaluated],
        "valid_count": len(valid_items),
        "rejected_count": len(rejected),
        "rejected": rejected,
    }
