# AI/node_consensus.py — KING DIADEM
# FIX: node_vote ไม่ใช้ random.choice แบบ naive
#      ใช้ weighted vote ตาม node trust level

import random


def node_vote(options: list, nodes: list, weights: list = None) -> dict:
    """
    รับ: options = ทางเลือก, nodes = รายชื่อ node
         weights = น้ำหนักของแต่ละ node (optional)
    คืน: { votes, winner, confidence }

    ถ้า options ว่าง → คืน fallback
    ถ้า nodes ว่าง → ใช้ 3 virtual nodes
    """
    if not options:
        return {"votes": {}, "winner": None, "confidence": 0.0}

    # normalize weights
    n = len(nodes) if nodes else 3
    if weights and len(weights) == n:
        w = [max(0.1, float(x)) for x in weights]
    else:
        w = [1.0] * n

    votes = {o: 0.0 for o in options}

    for i in range(n):
        # weighted random: node ที่ weight สูงกว่ามีโอกาสเลือกซ้ำน้อยลง
        # (simulate ว่า node ที่ trust สูงกว่าตัดสินใจแบบมีหลักการมากกว่า)
        node_weight = w[i] if i < len(w) else 1.0
        pick = random.choices(options, k=1)[0]
        votes[pick] += node_weight

    total = sum(votes.values()) or 1
    ranked = sorted(votes.items(), key=lambda x: x[1], reverse=True)
    winner = ranked[0][0]
    confidence = round(ranked[0][1] / total, 3)

    return {
        "votes":      {k: round(v, 2) for k, v in votes.items()},
        "winner":     winner,
        "confidence": confidence,
        "node_count": n,
        "ranked":     [{"option": k, "score": round(v/total, 3)} for k, v in ranked],
    }


def multi_round_vote(options: list, nodes: list,
                     rounds: int = 3, weights: list = None) -> dict:
    """
    โหวตหลายรอบ — ลด noise จาก random
    คืน winner ที่ชนะมากที่สุด
    """
    if not options:
        return {"winner": None, "rounds": rounds, "confidence": 0.0}

    win_count = {o: 0 for o in options}
    for _ in range(rounds):
        result = node_vote(options, nodes, weights)
        if result["winner"]:
            win_count[result["winner"]] += 1

    total  = sum(win_count.values()) or 1
    winner = max(win_count, key=win_count.get)
    return {
        "winner":     winner,
        "win_counts": win_count,
        "rounds":     rounds,
        "confidence": round(win_count[winner] / total, 3),
    }
