# AI Market Expansion Advisor for MSMEs — Dummy Prototype

A college-project prototype demonstrating the full user flow for an MSME market-expansion
advisor: Home → Business Details → Categorization → Recommendations → Market Details →
What-If → Strategy.

**Everything in this prototype is dummy / rule-based**, structured so it can be swapped for
real datasets, ML models and LLM calls later without changing the frontend contract.

---

## 1. Project Structure

```
project/
├── backend/
│   ├── app.py                  # FastAPI app entrypoint
│   ├── requirements.txt
│   ├── routes/
│   │   └── api.py              # All API endpoints
│   ├── services/
│   │   ├── data_loader.py      # Loads dummy markets.csv (pandas)
│   │   ├── categorization.py   # Dummy keyword-based categorization
│   │   ├── scoring.py          # Market Fit Score formula + MSME adjustment
│   │   └── strategy.py         # Rule-based strategy text generator
│   ├── models/
│   │   └── schemas.py          # Pydantic request/response models
│   └── data/
│       └── markets.csv         # Dummy dataset (12–15 Indian states)
│
├── frontend/                   # React (Vite) app
│   └── src/
│       ├── pages/               # Home, BusinessDetails, Categorization,
│       │                        # Recommendations, MarketDetails, WhatIf, Strategy
│       ├── components/Layout.jsx
│       ├── context/AppContext.jsx
│       ├── services/api.js
│       ├── App.jsx
│       └── main.jsx
│
└── README.md
```

---

## 2. Install & Run — Backend (FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

Backend will run at **http://localhost:8000**. Interactive API docs at
**http://localhost:8000/docs**.

---

## 3. Install & Run — Frontend (React / Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at **http://localhost:5173** and calls the backend at
`http://localhost:8000` (configured in `src/services/api.js`).

Run both servers at the same time (two terminals) to use the app end-to-end.

---

## 4. How Frontend ↔ Backend Communication Works

- The React app keeps the MSME form data and analysis results in a shared `AppContext`
  (`src/context/AppContext.jsx`) so state carries across pages without a database.
- `src/services/api.js` is the single place that calls the FastAPI backend using `fetch`:
  - `POST /analyze` — submits MSME details, gets back categorization + ranked markets
  - `GET /market/{state}` — gets a single market's detail/explanation
  - `POST /what-if` — recalculates a score for a scenario
  - `POST /strategy` — generates the entry-strategy text
- CORS is enabled on the FastAPI app (`app.py`) so the Vite dev server (a different port)
  is allowed to call it directly from the browser.

---

## 5. API Endpoints

| Method | Endpoint          | Purpose                                   |
|--------|-------------------|--------------------------------------------|
| POST   | `/analyze`        | Categorize product + score/rank all markets |
| GET    | `/markets`        | Raw dummy market dataset (debug/transparency) |
| GET    | `/market/{state}` | Detailed factor scores + explanation for one market |
| POST   | `/what-if`        | Recalculate score under a demand/transport-cost scenario |
| POST   | `/strategy`       | Generate a rule-based market entry strategy |

---

## 6. What's Dummy vs. What's Ready to Extend

| Component | Current (Prototype) | Designed to be replaced later with |
|---|---|---|
| Market dataset (`data/markets.csv`) | 15 Indian states, sample dummy values | Verified government/industry datasets (e.g. data.gov.in, Census, GST filings) loaded into a real database |
| Product categorization (`services/categorization.py`) | Simple keyword matching | NLP/LLM-based classifier |
| Market Fit Score (`services/scoring.py`) | Transparent weighted formula + simple MSME adjustment | Validated, data-driven ML/regression model trained on real outcomes |
| Market Entry Strategy (`services/strategy.py`) | Rule-based template text | LLM-generated, fully tailored strategy (an LLM API call could directly replace `generate_strategy()`) |
| Storage | In-memory / CSV via pandas | SQLite/Postgres, as noted in the original spec |

Every dummy module lives behind a clear function boundary (`categorize_product()`,
`score_all_markets()`, `generate_strategy()`) specifically so it can be swapped out without
touching the API routes or the React frontend.

---

## 7. Important Notes

- **No authentication** is implemented, as specified.
- **No paid APIs or GPU** are required — everything runs locally.
- All market values shown in the UI carry the disclaimer: *"Prototype demonstration — market
  values are sample data and will be replaced with verified datasets."*
- Technical terms (ML model names, "database", etc.) are intentionally kept out of the UI and
  confined to code comments / this README.
