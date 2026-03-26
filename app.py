from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import requests

app = Flask(__name__, static_folder='static')
CORS(app)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


def decision_engine(user_input):

    # ✅ กันพัง
    if not GEMINI_API_KEY:
        return "ERROR: ไม่มี GEMINI_API_KEY"

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"

        payload = {
            "contents": [{
                "parts": [{"text": user_input}]
            }]
        }

        res = requests.post(url, json=payload)

        # ✅ เช็ค response
        if res.status_code != 200:
            return f"API ERROR: {res.text}"

        data = res.json()

        reply = data['candidates'][0]['content']['parts'][0]['text']

        return reply

    except Exception as e:
        return f"SYSTEM ERROR: {str(e)}"


@app.route('/decision', methods=['POST'])
def decision():
    data = request.json
    user_input = data.get("input", "")

    result = decision_engine(user_input)

    return jsonify({"result": result})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
