from AI.decision_memory import get_memory


def decision_map():

    data=get_memory()

    map_nodes=[]

    for d in data:

        node={

            "question":d["question"],

            "pressure":len(d["options"])

        }

        map_nodes.append(node)

    return map_nodes
