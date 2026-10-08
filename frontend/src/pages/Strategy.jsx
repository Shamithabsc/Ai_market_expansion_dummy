import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { getStrategy } from "../services/api";

export default function Strategy() {
  const navigate = useNavigate();
  const { selectedState, msme, resetAll } = useAppContext();
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedState) {
      navigate("/recommendations");
      return;
    }
    getStrategy(selectedState, {
      ...msme,
      selling_price: Number(msme.selling_price),
      production_capacity: Number(msme.production_capacity),
      expansion_budget: Number(msme.expansion_budget),
    })
      .then(setStrategy)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState]);

  if (loading) return <div className="card loading-box"><div className="spinner" />Generating strategy…</div>;
  if (error) return <div className="card empty-state">{error}</div>;
  if (!strategy) return null;

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="section-title">Market Entry Strategy — {strategy.state}</div>
        <span className={`badge badge-${strategy.recommendation}`}>{strategy.recommendation}</span>
      </div>
      <div className="section-sub">
        A starting-point strategy generated from your inputs and the market's factor scores.
      </div>

      <ol className="strategy-list">
        <li><strong>Recommended Approach:</strong> {strategy.recommended_approach}</li>
        <li><strong>Target Customer:</strong> {strategy.target_customer}</li>
        <li>
          <strong>Suggested Channels:</strong>
          <ul>{strategy.suggested_channels.map((c) => <li key={c}>{c}</li>)}</ul>
        </li>
        <li><strong>Pricing Consideration:</strong> {strategy.pricing_consideration}</li>
        <li>
          <strong>Initial Launch Steps:</strong>
          <ul>{strategy.initial_launch_steps.map((s) => <li key={s}>{s}</li>)}</ul>
        </li>
        <li>
          <strong>Key Risks:</strong>
          <ul>{strategy.key_risks.map((r) => <li key={r}>{r}</li>)}</ul>
        </li>
      </ol>

      <div className="disclaimer-banner">
        This strategy is rule-based sample output for the prototype. A future version can connect
        this page to an LLM for a fully tailored, natural-language strategy.
      </div>

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={() => navigate("/what-if")}>← Back to What-If</button>
        <button className="btn btn-secondary" onClick={() => navigate("/recommendations")}>Back to Recommendations</button>
        <button className="btn btn-primary" onClick={() => { resetAll(); navigate("/"); }}>
          Start New Analysis
        </button>
      </div>
    </div>
  );
}
