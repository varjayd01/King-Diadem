# CIVIL WORK ENGINE
# Connects CIVIL_WORK_CORE to the decision routing layer.

from core.civil_work_core import evaluate_work_plan


def assess(pattern: dict) -> dict:
    user_input = pattern.get("input") or pattern.get("description") or ""
    tasks = pattern.get("tasks")

    if not tasks:
        tasks = [{"description": user_input}]

    if isinstance(tasks, str):
        tasks = [{"description": tasks}]

    return evaluate_work_plan(tasks)
