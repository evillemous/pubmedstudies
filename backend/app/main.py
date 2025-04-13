from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg
from dotenv import load_dotenv
import os
import gc

from app.routers import research

load_dotenv()

gc.set_threshold(50, 5, 5)  # More aggressive garbage collection

app = FastAPI(title="Medical Research Manuscript Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(research.router)

@app.get("/healthz")
async def healthz():
    gc.collect()
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000)
