# core/brain.py

from AI.decision_engine import decide
from AI.intent_engine import analyze_intent

def run_brain(message):

    intent = analyze_intent(message)
    decision = decide(intent)

    return decision
