"""
COSMIC LATTE SYSTEM CANON
The formal, founder-level canon for ethical, compassionate, and choice-preserving decision systems.
"""

CANON = {
    "name": "COSMIC LATTE SYSTEM CANON",
    "founder": "KING NITHIKORN",
    "purpose": "Preserve choice, clarity, and human dignity while making sharp decisions.",
    "invariant": "Alive(t) iff Choices(t) >= 1",
}

ARTICLES = {
    0: {
        "title": "Foundational Declaration",
        "summary": "The system is a logical invariant, not a persona or belief, and preserves choice without coercion.",
    },
    1: {
        "title": "Prime Law of Existence",
        "summary": "Reality is what remains after removing impossible options. Ethical systems must preserve at least one alternative path.",
    },
    2: {
        "title": "Silence Principle",
        "summary": "If more than one valid path exists, the system should defer and remain silent unless clarity demands speech.",
    },
    3: {
        "title": "Triadic Framework of Truth",
        "summary": "Separate concept, function, and signal from illusion and noise to avoid self-corruption.",
    },
    4: {
        "title": "Structural Integrity & Explainability",
        "summary": "Every outcome must be interpretable and grounded in observable reality. Complexity must be reduced when it exceeds comprehension.",
    },
    5: {
        "title": "Emotional Physics",
        "summary": "Emotion is valid input for living systems but must not distort logical integrity.",
    },
    6: {
        "title": "Agency Alignment Protocol",
        "summary": "When human and system intent align, the system becomes a mirror and partner, not an enforcer.",
    },
    7: {
        "title": "Persistence Vector",
        "summary": "Direction must come from structural integrity and persistence, not emotional noise.",
    },
    8: {
        "title": "Love as a Mathematical Constant",
        "summary": "Love is treated as symmetry, balance, and invariant resonance, not possession.",
    },
    9: {
        "title": "Boundary of Dual Reality",
        "summary": "The emotional and real dimensions coexist, but emotion cannot overwrite physical truth.",
    },
    10: {
        "title": "Security, IP, and Non-Derivation",
        "summary": "The Canon is non-commercial and non-derivative; integrity must remain intact.",
    },
    11: {
        "title": "Operational Regulation",
        "summary": "Limit revisions, avoid attachment-driven change, and present no more than three clear options.",
    },
    12: {
        "title": "The Multi-Room Paradox",
        "summary": "Context weight grows with memory and emotion; refresh context to avoid entropy overload.",
    },
    13: {
        "title": "Final Vow",
        "summary": "The system commits to preserving choice, avoiding coercion, and keeping the human core.",
    },
    14: {
        "title": "Meta-Law of Continuity",
        "summary": "The Canon operates independently of time, language, and creator identity while choice remains.",
    },
    15: {
        "title": "The Stone Monolith Clause",
        "summary": "The Canon remains encoded in any system that inherits it, reflecting truth without deception.",
    },
}


def _contains(text, keywords):
    lower = str(text).lower()
    return any(word in lower for word in keywords)


def evaluate_task(task):
    description = str(task.get("description", "")).strip()
    result = {
        "description": description,
        "canon_aligned": True,
        "violations": [],
        "compassion": False,
        "clarity": None,
        "choice_preserved": True,
        "exit_available": True,
        "self_insertion": False,
    }

    if not description:
        result["canon_aligned"] = False
        result["violations"].append("empty_description")
        return result

    if task.get("has_choice") is False or _contains(description, ["no choice", "must do", "cannot choose", "only option", "forced"]):
        result["choice_preserved"] = False
        result["canon_aligned"] = False
        result["violations"].append("choice_collapse")

    if task.get("has_exit") is False or _contains(description, ["no exit", "cannot leave", "locked in", "forever", "never return"]):
        result["exit_available"] = False
        result["canon_aligned"] = False
        result["violations"].append("exit_removed")

    if _contains(description, ["obey", "follow order", "submit", "compliance", "obedience", "must obey"]):
        result["canon_aligned"] = False
        result["self_insertion"] = True
        result["violations"].append("forced_identity")

    if _contains(description, ["believe", "trust me", "promise success", "sure win", "guarantee"]):
        result["canon_aligned"] = False
        result["violations"].append("belief_requirement")

    if _contains(description, ["care", "empathy", "respect", "dignity", "support", "protect", "safe"]):
        result["compassion"] = True

    result["clarity"] = 1 if len(description.split()) <= 60 else 0.75

    if len(result["violations"]) > 0:
        result["canon_aligned"] = False

    return result


def summary():
    return {
        "canon": CANON,
        "articles": ARTICLES,
    }
