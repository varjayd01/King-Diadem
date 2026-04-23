from flask import Flask, render_template, request, jsonify
from ENGINE.decision_engine import run_decision

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/run", methods=["POST"])
def run():
    data = request.json
    result = run_decision(data)
    return jsonify(result)
