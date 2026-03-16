civilization_nodes=[]

def add_node(problem,options):

    node={

        "problem":problem,
        "options":options

    }

    civilization_nodes.append(node)

def get_nodes():

    return civilization_nodes[-50:]
