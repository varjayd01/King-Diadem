
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from engine import run_engine  # ของพี่

app = FastAPI()

# static ไม่ชน root แล้ว
app.mount("/static", StaticFiles(directory="static"), name="static")

# หน้าเว็บ
@app.get("/")
def home():
    return FileResponse("static/index.html")

# API
class Input(BaseModel):
    text: str

@app.post("/brain")
def brain(data: Input):
    return run_engine(data.text)
