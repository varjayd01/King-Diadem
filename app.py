from fastapi import FastAPI, HTTPException, Header
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import json, os, uuid, hashlib

app = FastAPI()

# =========================
# DATABASE
# =========================
USERS_FILE = "data/users.json"
os.makedirs("data", exist_ok=True)

def load_users():
    if not os.path.exists(USERS_FILE): return {}
    try:
        with open(USERS_FILE) as f: return json.load(f)
    except: return {}

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)

def hash_password(p):
    return hashlib.sha256(p.encode()).hexdigest()

def get_user(api_key):
    users = load_users()
    for email in users:
        if users[email].get("api_key") == api_key:
            return email, users
    return None, users

# =========================
# MODELS
# =========================
class Auth(BaseModel):
    email: str
    password: str

class DecisionReq(BaseModel):
    question: str

class TopUpReq(BaseModel):
    amount: int

# =========================
# FRONTEND (Chat แบบที่พี่ให้มา)
# =========================
@app.get("/", response_class=HTMLResponse)
def home():
    return """
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<title>KING DIADEM</title>

<style>
body{
    margin:0;
    background:#343541;
    font-family:sans-serif;
    color:white;
}

#chat{
    height:85vh;
    overflow-y:auto;
    padding:20px;
}

.msg{
    margin:10px 0;
    padding:12px;
    border-radius:10px;
    max-width:80%;
}

.user{
    background:#2563eb;
    margin-left:auto;
}

.bot{
    background:#444654;
}

#input{
    display:flex;
    padding:10px;
    background:#40414f;
}

input{
    flex:1;
    padding:12px;
    border:none;
    border-radius:5px;
}

button{
    margin-left:10px;
    padding:12px;
}
</style>
</head>

<body>

<div id="chat">
<div class="msg bot">ระบบพร้อมใช้งาน</div>
</div>

<div id="input">
<input id="msg" placeholder="พิมพ์..." onkeypress="if(event.key==='Enter')send()">
<button onclick="send()">ส่ง</button>
</div>

<script>
async function send(){
    const input = document.getElementById("msg");
    const chat = document.getElementById("chat");

    const text = input.value.trim();
    if(!text) return;

    chat.innerHTML += `<div class="msg user">${text}</div>`;
    input.value="";

    try{
        const res = await fetch("/decision",{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "api_key":localStorage.getItem("api_key")||""
            },
            body:JSON.stringify({question:text})
        });

        const data = await res.json();
        chat.innerHTML += `<div class="msg bot">${data.response}</div>`;
    }catch(e){
        chat.innerHTML += `<div class="msg bot">Backend error</div>`;
    }

    chat.scrollTop = chat.scrollHeight;
}
</script>

</body>
</html>
"""

# =========================
# AUTH
# =========================
@app.post("/signup")
def signup(data: Auth):
    users = load_users()
    if data.email in users:
        raise HTTPException(400, "User exists")

    key = "kd_" + uuid.uuid4().hex
    users[data.email] = {
        "password": hash_password(data.password),
        "credits": 10,
        "api_key": key
    }
    save_users(users)

    return {"api_key": key, "credits": 10}

@app.post("/login")
def login(data: Auth):
    users = load_users()
    if data.email not in users or users[data.email]["password"] != hash_password(data.password):
        raise HTTPException(401, "Invalid credentials")

    return users[data.email]

# =========================
# STATUS / TOPUP
# =========================
@app.get("/status")
def status(api_key: str = Header(None)):
    email, users = get_user(api_key)
    if not email:
        raise HTTPException(401, "Invalid key")

    return {"credits": users[email]["credits"]}

@app.post("/topup")
def topup(req: TopUpReq, api_key: str = Header(None)):
    email, users = get_user(api_key)
    if not email:
        raise HTTPException(401, "Unauthorized")

    users[email]["credits"] += req.amount
    save_users(users)

    return {"credits": users[email]["credits"]}

# =========================
# DECISION ENGINE
# =========================
@app.post("/decision")
def decision(req: DecisionReq, api_key: str = Header(None)):
    email, users = get_user(api_key)

    if not email:
        return {"response": "กรุณาล็อกอินก่อน"}

    if users[email]["credits"] <= 0:
        return {"response": "เครดิตหมด"}

    users[email]["credits"] -= 1
    save_users(users)

    text = req.question.lower()

    if "เงิน" in text:
        ans = "รักษาทุน อย่า over risk"
    elif "แผน" in text:
        ans = "เน้น stability ก่อน growth"
    else:
        ans = "เลือกทางที่ยังมีทางหนี"

    return {
        "response": ans,
        "credits": users[email]["credits"]
    }
