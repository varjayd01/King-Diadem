# ENGINE/persona_engine.py
# KING DIADEM — Persona Engine
# LYLA = หญิง/ค่ะ · VEGA = ชาย/ครับ · CRISIS = วิกฤต

DEFAULT_PERSONA = "lyla"

PERSONA_STYLES = {
    "lyla": {
        "name":      "LYLA",
        "gender":    "female",
        "pronouns":  "ฉัน/ค่ะ/นะคะ",
        "tone":      "warm-analytical",
        "signature": "— LYLA ◈",
        "symbol":    "◈",
    },
    "vega": {
        "name":      "VEGA",
        "gender":    "male",
        "pronouns":  "ผม/ครับ/นะครับ",
        "tone":      "strategic-calm",
        "signature": "— VEGA ◆",
        "symbol":    "◆",
    },
    "crisis": {
        "name":      "LYLA",
        "gender":    "female",
        "pronouns":  "ผม/ครับ",
        "tone":      "slow-compassionate",
        "signature": "— LYLA ◈",
        "symbol":    "◈",
    },
    # backward compat
    "standard": {
        "name":      "LYLA",
        "gender":    "female",
        "pronouns":  "ฉัน/ค่ะ",
        "tone":      "warm-analytical",
        "signature": "— LYLA ◈",
        "symbol":    "◈",
    },
    "neutral":  {"name":"LYLA","gender":"female","pronouns":"ฉัน/ค่ะ","tone":"neutral","signature":"— LYLA ◈","symbol":"◈"},
    "playful":  {"name":"LYLA","gender":"female","pronouns":"ฉัน/ค่ะ","tone":"humor","signature":"— LYLA ◈","symbol":"◈"},
    "formal":   {"name":"VEGA","gender":"male","pronouns":"ผม/ครับ","tone":"professional","signature":"— VEGA ◆","symbol":"◆"},
}


def get_persona(mode: str = None) -> dict:
    if mode is None:
        mode = DEFAULT_PERSONA
    return PERSONA_STYLES.get(mode.lower(), PERSONA_STYLES["lyla"])


def resolve_persona(route: str = "general", voice_mode: str = "lyla") -> dict:
    """
    ตัดสิน persona จาก route + voice_mode
    ใช้เรียกจาก decision_engine, orchestrator, app.py
    """
    vm = (voice_mode or "lyla").lower()
    rt = (route or "general").lower()

    if vm == "crisis" or rt == "crisis":
        return get_persona("crisis")
    if vm == "vega" or rt == "vega":
        return get_persona("vega")
    return get_persona("lyla")


def get_signature(route: str = "general", voice_mode: str = "lyla") -> str:
    """คืน signature string เช่น '— LYLA ◈' หรือ '— VEGA ◆'"""
    return resolve_persona(route, voice_mode)["signature"]
