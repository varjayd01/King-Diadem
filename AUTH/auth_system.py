from AUTH.api_key_manager import use_credit


def authorize(username: str):

    ok = use_credit(username, 1)

    if not ok:
        return {
            "status": "blocked",
            "reason": "no credits"
        }

    return {
        "status": "allowed"
    }
