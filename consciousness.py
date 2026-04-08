# consciousness.py

from ENGINE.decision_engine import decide
from INTELLIGENCE.risk_engine import analyze as risk_analyze
from AI.intent_engine import analyze_intent

def consciousness(input_data):
    intent = analyze_intent(input_data)
    risk = risk_analyze(input_data)

    decision = decide(
        input=input_data,
        intent=intent,
        risk=risk
    )

    return decision
