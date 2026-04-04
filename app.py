import os
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from dotenv import load_dotenv
import google.generativeai as genai

# [IMPORT CUSTOM MODULES] - ดึงไฟล์ที่พี่ทำไว้ใน GitHub มาใช้งานจริง
# หมายเหตุ: ชื่อไฟล์ต้องตรงกับใน Repo ของพี่นะตะ
try:
    from AUTH.auth_system import AuthManager
    from SIMULATIONS.scenario_engine import JewferEngine
    from PAYMENT.wallet_engine import WalletManager
    from INTELLIGENCE.decision_intelligence import DecisionCore
except ImportError as e:
    print(f"Warning: ระบบบางส่วนยังไม่ได้เชื่อมต่อ: {e}")

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "LYLA_DIADEM_CORE_STABILITY")

# --- AI CONFIG: Google AI Studio ---
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

# --- INITIALIZE ENGINES ---
auth_handler = AuthManager() if 'AuthManager' in globals() else None
jewfer_sim = JewferEngine() if 'JewferEngine' in globals() else None
wallet = WalletManager() if 'WalletManager' in globals() else None

# ---------------------------------------------------------
# [LOGIC] ระบบคิดแบบ LYLA KERNEL (Decision Intelligence)
# ---------------------------------------------------------
def lyla_logic_process(user_msg):
    # ดึง System Prompt สัจธรรมที่พี่วางไว้ใน Decision Intelligence มาใช้
    system_instruction = "คุณคือ LYLA KERNEL ระบบปกครอง AI ที่ยึดถือสัจธรรมและปฏิจจสมุปบาท..."
    prompt = f"{system_instruction}\n\nจอมทัพสั่งว่า: {user_msg}"
    response = model.generate_content(prompt)
    return response.text

# ---------------------------------------------------------
# [ROUTES] หน้ากากและปุ่มกด (UI/UX Action)
# ---------------------------------------------------------

@app.route('/')
def index():
    return render_template('index.html')

# --- 1. ระบบ Login/Google Auth (จากภาพ 32217) ---
@app.route('/api/auth/login', methods=['POST'])
def login():
    # เรียกใช้ auth_system.py ที่พี่เตรียมไว้
    data = request.json
    result = auth_handler.authenticate(data) if auth_handler else {"status": "mock_success"}
    return jsonify(result)

# --- 2. ระบบ Simulation: Jewfer Engine (จากภาพ 32219) ---
@app.route('/api/simulate', methods=['POST'])
def simulate():
    data = request.json
    scenario = data.get('scenario')
    # รัน Jewfer Simulation ที่พี่สร้างมา 10-20 หน้า!
    result = jewfer_sim.run_simulation(scenario) if jewfer_sim else "Engine Offline"
    return jsonify({"simulation_result": result})

# --- 3. ระบบ Chat (Intelligence Core) ---
@app.route('/api/v1/chat', methods=['POST'])
def chat():
    data = request.json
    msg = data.get('message', '')
    try:
        ai_response = lyla_logic_process(msg)
    except Exception as e:
        ai_response = f"FAILED: ระบบขัดข้องเนื่องจาก {e}"
    return jsonify({"operator": "LYLA KERNEL", "response": ai_response})

# --- 4. ระบบ Payment/Wallet (จากภาพ 32216) ---
@app.route('/api/payment/checkout', methods=['POST'])
def checkout():
    plan = request.json.get('plan') # 299, 789, 2000
    checkout_url = wallet.create_session(plan) if wallet else "#"
    return jsonify({"url": checkout_url})

# ---------------------------------------------------------
# [STABILITY CHECK]
# ---------------------------------------------------------
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
        
