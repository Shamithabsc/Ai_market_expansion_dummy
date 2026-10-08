import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { analyzeMarkets } from "../services/api";

export default function Categorization() {
  const navigate = useNavigate();
  const { msme, setAnalysis } = useAppContext();
  const [status, setStatus] = useState("loading"); // loading | done | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!msme.product_name) {
      navigate("/business-details");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    const payload = {
      ...msme,
      selling_price: Number(msme.selling_price),
      production_capacity: Number(msme.production_capacity),
      expansion_budget: Number(msme.expansion_budget),
    };

    // Small artificial delay so the "analyzing" state is visible, like a real pipeline.
    const timer = setTimeout(async () => {
      try {
        const data = await analyzeMarkets(payload);
        if (cancelled) return;
        setResult(data);
        setAnalysis(data);
        setStatus("done");
      } catch (err) {
        if (cancelled) return;
        setErrorMsg(err.message);
        setStatus("error");
      }
    }, 1200);

    return () => { cancelled = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading") {
    return (
      <div className="card">
        <div className="loading-box">
          <div className="spinner" />
          Analyzing your product and evaluating markets…
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="card">
        <div className="empty-state">
          Could not reach the backend API. Make sure the FastAPI server is running on
          http://localhost:8000.
          <div style={{ marginTop: 10, fontSize: 13, color: "var(--color-avoid)" }}>{errorMsg}</div>
        </div>
        <div className="btn-row">
          <button className="btn btn-secondary" onClick={() => navigate("/business-details")}>← Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="section-title">Product Categorization</div>
      <div className="section-sub">Your product has been automatically categorized.</div>

      <div style={{ display: "flex", gap: 32, alignItems: "center", padding: "20px 0" }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Product Category</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-primary-dark)" }}>
            {result.categorization.category}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Confidence</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            {Math.round(result.categorization.confidence * 100)}%
          </div>
        </div>
      </div>

      <div className="disclaimer-banner">{result.disclaimer}</div>

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={() => navigate("/business-details")}>← Back</button>
        <button className="btn btn-primary" onClick={() => navigate("/recommendations")}>
          View Market Recommendations →
        </button>
      </div>
    </div>
  );
}
