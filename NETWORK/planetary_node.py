import uuid
import socket
import time

from NETWORK.node_registry import register_node,heartbeat


NODE_ID=None


def start_node():

    global NODE_ID

    NODE_ID=str(uuid.uuid4())

    host=socket.gethostname()

    data={

        "host":host,

        "started":time.time(),

        "status":"active"

    }

    register_node(NODE_ID,data)

    return {

        "node_id":NODE_ID,

        "host":host

    }


def node_heartbeat():

    if NODE_ID:

        heartbeat(NODE_ID)
