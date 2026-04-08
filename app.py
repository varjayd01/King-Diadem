from flask import Flask, request, jsonify, render_template
from ENGINE.decision_engine import KingDiademEngine

app = Flask(__name__)
engine = KingDiademEngine()

@app.get("/")
def home():
    return render_template("index.html")

@app.post("/run")
def run():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    mode = data.get("mode", "chat")
    result = engine.run(text, mode)
    return jsonify(result)
