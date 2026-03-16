import random

def planetary_status():

    freedom=random.randint(20,80)

    status="stable"

    if freedom < 30:
        status="compression"

    if freedom > 60:
        status="expansion"

    return {

        "freedom_index":freedom,
        "planetary_status":status,
        "signals":[

            "economic",
            "social",
            "environment",
            "technological"

        ]

    }
