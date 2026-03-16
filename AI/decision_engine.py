import random

from AI.simulation_engine import Simulation
from AI.decision_memory import store_decision
from AI.planetary_reality import planetary_status


sim=Simulation()


def generate_options(question):

    base=[

        "gather more information",

        "act cautiously",

        "delay decision",

        "consult trusted people",

        "test small experiment"

    ]

    extra=[

        "pivot strategy",

        "reduce risk exposure",

        "increase resilience",

        "protect survival resources",

        "create new opportunity"

    ]

    options=random.sample(base,3)

    if random.random()>0.5:

        options.append(random.choice(extra))

    return options



def planetary_adjustment(options):

    planet=planetary_status()

    stability=planet["planetary_stability"]

    if stability<40:

        options.append("prioritize stability and safety")

    if stability<25:

        options.append("avoid large irreversible decisions")

    return options,planet



def process_decision(question):

    options=generate_options(question)

    options=sim.simulate(question)+options

    options,planet=planetary_adjustment(options)

    store_decision(question,options)

    return {

        "options":options,

        "planetary_context":planet

    }
