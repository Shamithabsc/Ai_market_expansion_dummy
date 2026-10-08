import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { runWhatIf } from "../services/api";

export default function WhatIf() {
  const navigate = useNavigate();
  const { selectedState, msme } = useAppContext();
  const [demandChange, setDemandChange] = useState(0);
  const [transportChange, setTransportChange] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const payload = () => ({
    state: selectedState,
    msme: {
      ...msme,
      selling_price: Number(msme.selling_price),
      production_capacity: Number(msme.production_capacity),
      expansion_budget: Number(msme.expansion_budget),
    },
    demandChangePct: demandChange,
    transportCostChangePct: transportChange,
  });

  const runScenario = async () => {
    if (!selectedState) return;
    setLoading(true);
    setError("");
    try {
      const data = await runWhatIf(payload());
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedState) {
      navigate("/recommendations");
      return;
    }
    runScenario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState]);

  // Recalculate automatically whenever a slider moves.
  useEffect(() => {
    if (!selectedState) return;
    const t = setTimeout(runScenario, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demandChange, transportChange]);

  const reset = () => {
    setDemandChange(0);
    setTransportChange(0);
  };

  return (
    <div className="card">
      <div className="section-title">What-If Analysis — {selectedState}</div>
      <div className="section-sub">Adjust assumptions and see how the Market Fit Score changes.</div>

      <div className="two-col">
        <div>
          <div className="slider-block">
            <label>
              <span>Demand Change</span>
              <span>{demandChange > 0 ? "+" : ""}{demandChange}%</span>
            </label>
            <input
              type="range" min={-20} max={20} step={1}
              value={demandChange}
              onChange={(e) => setDemandChange(Number(e.target.value))}
            />
          </div>

          <div className="slider-block">
            <label>
              <span>Transportation Cost Change</span>
              <span>{transportChange > 0 ? "+" : ""}{transportChange}%</span>
            </label>
            <input
              type="range" min={-20} max={50} step={1}
              value={transportChange}
              onChange={(e) => setTransportChange(Number(e.target.value))}
            />
          </div>

          <div className="btn-row">
            <button className="btn btn-primary" onClick={runScenario} disabled={loading}>
              {loading ? "Calculating…" : "Run Scenario"}
            </button>
            <button className="btn btn-secondary" onClick={reset}>Reset</button>
          </div>
        </div>

        <div className="card" style={{ background: "var(--color-bg)" }}>
          {error && <div className="empty-state">{error}</div>}
          {result && !error && (
            <>
              <div className="comparison-box">
                <div>
                  <div className="value">{result.original_score}</div>
                  <div className="label">Original Score</div>
                  <span className={`badge badge-${result.original_recommendation}`} style={{ marginTop: 8, display: "inline-block" }}>
                    {result.original_recommendation}
                  </span>
                </div>
                <div>
                  <div className="value">{result.scenario_score}</div>
                  <div className="label">Scenario Score</div>
                  <span className={`badge badge-${result.scenario_recommendation}`} style={{ marginTop: 8, display: "inline-block" }}>
                    {result.scenario_recommendation}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: "center", marginTop: 10 }}>
                <div className={`value ${result.change >= 0 ? "change-positive" : "change-negative"}`} style={{ fontSize: 24, fontWeight: 800 }}>
                  {result.change > 0 ? "+" : ""}{result.change}
                </div>
                <div className="label">Score Change</div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={() => navigate("/market-details")}>← Back to Details</button>
        <button className="btn btn-primary" onClick={() => navigate("/strategy")}>Continue to Strategy →</button>
      </div>
    </div>
  );
}
