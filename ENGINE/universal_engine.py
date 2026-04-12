# UNIVERSAL ENGINE (รวมทุกระบบแบบไม่พัง)

# ===== SAFE IMPORT =====
def safe_import(path, func):
    try:
        module = __import__(path, fromlist=[func])
        return getattr(module, func)
    except:
        return None


# ===== LOAD OPTIONAL ENGINES =====
run_decision = safe_import("ENGINE.decision_engine", "run_decision")

survival_engine = safe_import("DOMAINS.survival_engine", "run")
business_engine = safe_import("DOMAINS.business_engine", "run")
human_engine = safe_import("DOMAINS.human_engine", "run")


# ===== CORE =====
def UNIVERSAL_ENGINE(input_data: dict):

    output = {
        "status": "ok",
        "layers": {}
    }

    try:
        # ===== DECISION CORE =====
        if run_decision:
            output["layers"]["decision"] = run_decision(input_data)

        # ===== OPTIONAL LAYERS =====
        if survival_engine:
            output["layers"]["survival"] = survival_engine(input_data)

        if business_engine:
            output["layers"]["business"] = business_engine(input_data)

        if human_engine:
            output["layers"]["human"] = human_engine(input_data)

        return output

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
}
