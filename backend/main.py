import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import analyze, scrape

load_dotenv()

app = FastAPI(title="Resume Screener API")

# ALLOWED_ORIGINS: comma-separated list of frontend origins.
# Set in .env for local dev; set as env var on Railway for production.
# Example: ALLOWED_ORIGINS=https://resume-screener.vercel.app,http://localhost:5173
_raw = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173")
origins = [o.strip() for o in _raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api")
app.include_router(scrape.router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "ok"}
