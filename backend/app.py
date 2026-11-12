from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.api import router

app = FastAPI(
    title="AI Market Expansion Advisor for MSMEs — Synthetic Dataset API",
    description=(
        "Backend for the AI Market Expansion Advisor. Uses a 2024-25 synthetic benchmark dataset "
        "covering all 36 Indian States and Union Territories across 6 product categories. "
        "All scoring is rule-based, deterministic, and transparent. "
        "Synthetic data only — not official Census, MOSPI, or RBI statistics."
    ),
    version="1.0.0",
)

# Allow the React dev server (Vite default port 5173) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # prototype only — restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {
        "message": "AI Market Expansion Advisor for MSMEs API is running.",
        "dataset": "Synthetic benchmark — 36 Indian States/UTs, 1000 records, 100% complete",
        "disclaimer": "Synthetic data only. Not official government statistics.",
        "docs": "/docs",
    }
