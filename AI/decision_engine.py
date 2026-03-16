import random

from AI.simulation_engine import Simulation
from AI.decision_memory import store_decision
from AI.planetary_reality import planetary_status
from AI.consensus_engine import build_consensus
from AI.node_consensus import node_vote

from NETWORK.node_registry import get_nodes


sim = Simulation()


def generate_options(question):

    base = [

        "gather more information",

        "act cautiously",

        "delay decision",

        "consult trusted people",

        "run a small experiment"

    ]

    strategic = [

        "pivot strategy",

        "reduce exposure",

        "increase resilience",

        "secure survival resources",

        "explore new opportunity"

    ]

    options = random.sample(base, 3)

    if random.random() > 0.5:

        options.append(random.choice(strategic))

    return options



def council_reasoning(question, options):

    council_results = {

        "Altair": random.choice(options),

        "Vega": random.choice(options),

        "Lyla": random.choice(options),

        "Titan": random.choice(options),

        "FATE": random.choice(options),

        "DriftZero": random.choice(options)

    }

    summary = build_consensus(council_results)

    return council_results, summary



def node_reasoning(options):

    nodes = get_nodes()

    vote = node_vote(options, nodes)

    return vote



def process_decision(question):

    options = generate_options(question)

    sim_results = sim.simulate(question)

    options = options + sim_results

    planet = planetary_status()

    council_results, council_summary = council_reasoning(question, options)

    node_result = node_reasoning(options)

    final_choice = node_result["winner"]

    store_decision(question, options)

    return {

        "options": options,

        "consensus": final_choice,

        "planetary_context": planet,

        "council": council_results,

        "council_summary": council_summary,

        "node_votes": node_result["votes"]

    }
