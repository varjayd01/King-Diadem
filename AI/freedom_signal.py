# AI/freedom_signal.py — KING DIADEM
# FIX: formula จาก paste ใหม่ (choices - crisis) / questions

stats = {"questions": 0, "choices": 0, "crisis": 0}

def record_question(): stats["questions"] += 1
def record_choice():   stats["choices"]   += 1
def record_crisis():   stats["crisis"]    += 1

def freedom_index() -> int:
    q = stats["questions"]
    if q == 0:
        return 50
    value = (stats["choices"] - stats["crisis"]) / q
    return max(0, min(100, int(50 + value * 50)))
