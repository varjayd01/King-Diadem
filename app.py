from flask import Flask, render_template, jsonify, request
from ENGINE.decision_engine import engine

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/decision', methods=['POST'])
def process_decision():
    data = request.json
    # รันผ่าน Decision Engine ตัวพิมพ์ใหญ่เท่านั้น!
    result = engine.evaluate_drift(data)
    return jsonify(result)

if __name__ == '__main__':
    # รันยาวๆ ตามที่จอมทัพสั่ง
    app.run(debug=True, port=5000)
    
