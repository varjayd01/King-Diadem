from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from openai import OpenAI
import os

from ENGINE.realhuman_survivorengine import RealHumanSurvivorEngine, from_dict

app = FastAPI()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

engine = RealHumanSurvivorEngine()

# serve frontend
app.mount("/", StaticFiles(directory="static", html=True), name="static")


class InputData(BaseModel):
    text: str
    energy: float
    food_access: bool
    safe_place: bool
    mental_state: str


@app.post("/ENGINE")
def run_engine(data: InputData):

    state = from_dict(data.dict())
    survival = engine.run(state)

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "You are survival AI"},
                {"role": "user", "content": data.text}
            ]
        )
        ai = response.choices[0].message.content
    except Exception as e:
        ai = f"[GPT FAIL] {str(e)}"

    return {
        "survival": survival.__dict__,
        "ai": ai
    }
