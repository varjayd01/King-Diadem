# =========================
# ⚡ KING DIADEM
# Energy Governor (Upgraded)
# =========================

import time

REQUEST_LOG = {}

LIMIT = 30          # max requests
WINDOW = 60         # seconds

# 🔥 ENERGY MODEL
BASE_ENERGY = 100
RECOVERY_RATE = 0.8   # energy per second
COST_PER_REQUEST = 3


# =========================
# 🔐 CORE CHECK
# =========================
def allow_request(api_key: str):

    now = time.time()

    user = REQUEST_LOG.get(api_key, {
        "timestamps": [],
        "energy": BASE_ENERGY,
        "last_update": now
    })

    # ---------------------
    # ♻️ RECOVER ENERGY
    # ---------------------
    elapsed = now - user["last_update"]
    recovered = elapsed * RECOVERY_RATE

    user["energy"] = min(BASE_ENERGY, user["energy"] + recovered)
    user["last_update"] = now

    # ---------------------
    # 🧹 CLEAN OLD REQUESTS
    # ---------------------
    user["timestamps"] = [
        t for t in user["timestamps"] if now - t < WINDOW
    ]

    # ---------------------
    # ❌ HARD LIMIT
    # ---------------------
    if len(user["timestamps"]) >= LIMIT:
        return False, "RATE_LIMIT"

    # ---------------------
    # ❌ ENERGY CHECK
    # ---------------------
    if user["energy"] < COST_PER_REQUEST:
        return False, "NO_ENERGY"

    # ---------------------
    # ✅ PASS
    # ---------------------
    user["timestamps"].append(now)
    user["energy"] -= COST_PER_REQUEST

    REQUEST_LOG[api_key] = user

    return True, {
        "energy": round(user["energy"], 2),
        "remaining_requests": LIMIT - len(user["timestamps"])
    }


# =========================
# 📊 STATUS (ให้ UI เรียกได้)
# =========================
def get_status(api_key: str):

    user = REQUEST_LOG.get(api_key)

    if not user:
        return {
            "energy": BASE_ENERGY,
            "remaining_requests": LIMIT
        }

    return {
        "energy": round(user["energy"], 2),
        "remaining_requests": LIMIT - len(user["timestamps"])
    }
