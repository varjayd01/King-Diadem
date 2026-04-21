from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder="static")

@app.route("/")
def index():
    return send_from_directory("static", "index.html")

@app.route("/decision", methods=["POST"])
def decision():
    data = request.json

    text = data.get("input", "")
    energy = data.get("energy")
    mode = data.get("mode")

    # MOCK ENGINE (พี่เอาไปเสียบของจริงทีหลังได้เลย)
    result = f"""
[King Diadem Decision]

Input: {text}
Energy: {energy}
Mode: {mode}

→ Recommended Action:
Move forward carefully. Preserve choice. Avoid collapse.
"""

    return jsonify({"result": result})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
