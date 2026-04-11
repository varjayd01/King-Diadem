from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from passlib.context import CryptContext

app = FastAPI()

# ===== USER SYSTEM =====
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

users = {}  # temp memory db
usage = {}  # track usage

FREE_LIMIT = 5  # ฟรีวันละ 5 ครั้ง

def hash_password(pw):
    return pwd_context.hash(pw)

def verify(pw, hashed):
    return pwd_context.verify(pw, hashed)

# ===== MODEL =====
class Input(BaseModel):
    location: str
    food: str
    money: int
    risk: int
    username: str

# ===== AI =====
def core_logic(data):
    if data["money"] < 50:
        return "ประหยัดก่อน"
    elif data["risk"] > 7:
        return "อย่าเสี่ยง"
    return "ลุยหาโอกาส"

# ===== API =====
@app.post("/simulate")
def simulate(data: Input):

    # check user
    if data.username not in users:
        return {"error": "no user"}

    # quota check
    usage.setdefault(data.username, 0)

    if usage[data.username] >= FREE_LIMIT:
        return {"error": "limit reached"}

    usage[data.username] += 1

    result = core_logic(data.dict())

    return {
        "best_action": result,
        "used": usage[data.username],
        "limit": FREE_LIMIT
    }

# ===== AUTH =====
@app.post("/register")
def register(username: str = Form(...), password: str = Form(...)):
    if username in users:
        return {"error": "exists"}

    users[username] = hash_password(password)
    usage[username] = 0
    return {"status": "registered"}

@app.post("/login")
def login(username: str = Form(...), password: str = Form(...)):
    if username not in users:
        return {"error": "no user"}

    if not verify(password, users[username]):
        return {"error": "wrong password"}

    return {"status": "ok"}

# ===== UI =====
@app.get("/", response_class=HTMLResponse)
def home():
    return """
    <html>
    <body style="background:black;color:white;font-family:sans-serif">

    <h2>🔥 KING DIADEM</h2>

    <h3>สมัคร</h3>
    <input id="r_user"><input id="r_pass">
    <button onclick="reg()">Register</button>

    <h3>ล็อกอิน</h3>
    <input id="l_user"><input id="l_pass">
    <button onclick="login()">Login</button>

    <h3>ใช้งาน</h3>
    <input id="location" placeholder="location"><br>
    <input id="food" placeholder="food"><br>
    <input id="money" placeholder="money"><br>
    <input id="risk" placeholder="risk"><br><br>

    <button onclick="run()">RUN</button>

    <pre id="out"></pre>

<script>
let currentUser = ""

async function reg(){
    const f = new FormData()
    f.append("username", r_user.value)
    f.append("password", r_pass.value)

    const res = await fetch('/register',{method:'POST',body:f})
    out.innerText = JSON.stringify(await res.json())
}

async function login(){
    const f = new FormData()
    f.append("username", l_user.value)
    f.append("password", l_pass.value)

    const res = await fetch('/login',{method:'POST',body:f})
    const data = await res.json()

    if(data.status==="ok"){
        currentUser = l_user.value
    }

    out.innerText = JSON.stringify(data)
}

async function run(){
    const res = await fetch('/simulate',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            location:location.value,
            food:food.value,
            money:parseInt(money.value),
            risk:parseInt(risk.value),
            username: currentUser
        })
    })

    out.innerText = JSON.stringify(await res.json(),null,2)
}
</script>

    </body>
    </html>
    """
