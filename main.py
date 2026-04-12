import os
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

# ===== IMPORT APP =====
from app import app

# ===== STATIC =====
app.mount("/static", StaticFiles(directory="static"), name="static")

# ===== HEALTH CHECK =====
@app.get("/health")
def health():
    return {"status": "ok"}

# ===== RENDER ENTRY =====
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
