from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.api import router

app = FastAPI(
    title="AI Market Expansion Advisor for MSMEs — Dummy Prototype API",
    description="Prototype backend. All scoring logic is dummy/rule-based and modular "
                "for later replacement with real ML/LLM components.",
    version="0.1.0",
)

# Allow the React dev server (Vite default port 5173, CRA default 3000) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # prototype only — restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {
        "message": "AI Market Expansion Advisor for MSMEs — dummy prototype API is running.",
        "docs": "/docs",
    }
