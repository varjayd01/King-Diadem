# AI/civilization_learning.py
_learning = []
def record_learning(question="", decision="", planet_context=None, success=None):
    _learning.append({"question": question, "decision": decision,
                       "context": planet_context or {}, "success": success})
def get_learning() -> list:
    return _learning
