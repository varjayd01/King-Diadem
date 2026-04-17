def council_engine(decision):

    if decision["action"] == "stabilize":
        score = 90
    elif decision["action"] == "recover_resource":
        score = 70
    else:
        score = 50

    return {
        "decision": decision,
        "score": score
    }
