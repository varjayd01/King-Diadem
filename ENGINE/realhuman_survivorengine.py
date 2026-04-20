from dataclasses import dataclass
from typing import List, Dict, Any


@dataclass
class HumanState:
    energy: float
    money: float
    food_access: bool
    safe_place: bool
    mental_state: str
    time_available: float


@dataclass
class SurvivalOutput:
    status: str
    actions: List[str]
    warnings: List[str]
    next_step: str


def from_dict(data: dict) -> HumanState:
    return HumanState(
        energy=data.get("energy", 50),
        money=data.get("money", 0),
        food_access=data.get("food_access") or data.get("food", False),
        safe_place=data.get("safe_place") or data.get("safe", False),
        mental_state=data.get("mental_state", "stable"),
        time_available=data.get("time_available", 1)
    )


class RealHumanSurvivorEngine:

    def __init__(self):
        self.MIN_ENERGY = 20

    def run(self, state: HumanState) -> SurvivalOutput:

        if state.mental_state == "overwhelmed":
            return SurvivalOutput(
                status="RESET_REQUIRED",
                actions=[
                    "Stop all decisions",
                    "Drink water",
                    "Breathing 4-4-6",
                    "Lie down"
                ],
                warnings=["Do not decide anything now"],
                next_step="Reset first"
            )

        if not state.food_access:
            return SurvivalOutput(
                status="NO_FOOD",
                actions=["Find cheap food now"],
                warnings=["Energy will crash"],
                next_step="Eat first"
            )

        if not state.safe_place:
            return SurvivalOutput(
                status="NO_SHELTER",
                actions=["Find safe place"],
                warnings=["Safety > everything"],
                next_step="Move immediately"
            )

        if state.energy < self.MIN_ENERGY:
            return SurvivalOutput(
                status="LOW_ENERGY",
                actions=["Eat", "Sleep 30 min"],
                warnings=["Low brain power"],
                next_step="Recover energy"
            )

        return SurvivalOutput(
            status="STABLE",
            actions=["Focus 1 task"],
            warnings=["Don't overload"],
            next_step="Continue"
        )
