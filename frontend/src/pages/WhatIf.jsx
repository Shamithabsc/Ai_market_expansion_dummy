import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { runWhatIf } from "../services/api";
import {
  SlidersIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  RefreshIcon,
  InfoIcon,
  SparklesIcon,
  AlertTriangleIcon,
  TargetIcon,
  CheckCircleIcon,
  LayersIcon,
} from "../components/Icons";

export default function WhatIf() {
  const navigate = useNavigate();
  const { selectedState, setSelectedState, msme, analysis } = useAppContext();

  const activeState = selectedState || (analysis?.top_markets?.length > 0 ? analysis.top_markets[0].state : null);

  const [demandChange, setDemandChange] = useState(0);
  const [transportChange, setTransportChange] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const payload = () => ({
    state: activeState,
    msme: {
      ...msme,
      selling_price: Number(msme.selling_price || 0),
      production_capacity: Number(msme.production_capacity || 0),
      expansion_budget: Number(msme.expansion_budget || 0),
    },
    demandChangePct: demandChange,
    transportCostChangePct: transportChange,
  });

  const runScenario = async () => {
    if (!activeState) return;
    setLoading(true);
    setError("");
    try {
      const data = await runWhatIf(payload());
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to calculate what-if scenario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeState) return;
    runScenario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeState]);

  useEffect(() => {
    if (!activeState) return;
    const t = setTimeout(runScenario, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demandChange, transportChange]);

  const handleStateChange = (newState) => {
    setSelectedState(newState);
  };

  const applyPreset = (dChange, tChange) => {
    setDemandChange(dChange);
    setTransportChange(tChange);
  };

  const reset = () => {
    setDemandChange(0);
    setTransportChange(0);
  };

  if (!activeState) {
    return (
      <div className="card empty-state">
        <div className="empty-state-icon">
          <SlidersIcon size={28} />
        </div>
        <div className="empty-state-title">No Market Selected for Simulation</div>
        <div className="empty-state-desc">
          To simulate sensitivity scenarios, please complete an initial market analysis and select a candidate state.
        </div>
        <button className="btn btn-teal" onClick={() => navigate("/business-details")}>
          <span>Start Market Analysis</span>
          <ArrowRightIcon size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Simulation Header */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span className="badge badge-teal" style={{ fontSize: "11px" }}>
                Interactive Scenario Engine
              </span>
              {analysis?.all_markets && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Target State:</span>
                  <select
                    value={activeState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="form-select"
                    style={{ padding: "4px 10px", fontSize: "13px", width: "auto" }}
                  >
                    {analysis.all_markets.map((market) => (
                      <option key={market.state} value={market.state}>
                        {market.state} (Score: {market.market_fit_score})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <h1 className="section-title" style={{ fontSize: "24px", margin: 0 }}>
              What-If Scenario Simulation &mdash; {activeState}
            </h1>
            <div className="section-sub" style={{ margin: "4px 0 0" }}>
              Test how hypothetical demand shifts and transportation freight fluctuations alter scores and state rankings.
            </div>
          </div>

          <button className="btn btn-secondary" onClick={reset} style={{ fontSize: "13px" }}>
            <RefreshIcon size={14} />
            <span>Reset Baseline (0%)</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Controls & Scorecard */}
      <div className="two-col">
        {/* Controls Column */}
        <div className="card">
          <h2 className="card-title" style={{ fontSize: "16px", marginBottom: "16px" }}>
            Simulation Parameters
          </h2>

          {/* Presets */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
              Quick Scenario Presets
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "12px", padding: "5px 10px" }}
                onClick={() => applyPreset(0, 0)}
              >
                Base Case (0%)
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "12px", padding: "5px 10px" }}
                onClick={() => applyPreset(15, 0)}
              >
                Demand Surge (+15%)
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "12px", padding: "5px 10px" }}
                onClick={() => applyPreset(0, 30)}
              >
                Freight Hike (+30%)
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "12px", padding: "5px 10px" }}
                onClick={() => applyPreset(-10, 25)}
              >
                Stagflation (-10% / +25%)
              </button>
            </div>
          </div>

          {/* Slider 1: Demand */}
          <div className="slider-block">
            <label>
              <span>Consumer Demand Fluctuation</span>
              <span className="slider-value-pill" style={{ backgroundColor: demandChange > 0 ? "var(--color-expand)" : demandChange < 0 ? "var(--color-avoid)" : "var(--color-navy)" }}>
                {demandChange > 0 ? "+" : ""}{demandChange}%
              </span>
            </label>
            <input
              type="range"
              min={-20}
              max={20}
              step={1}
              value={demandChange}
              onChange={(e) => setDemandChange(Number(e.target.value))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--color-text-muted)", marginTop: "6px" }}>
              <span>-20% (Contraction)</span>
              <span>0% (Baseline)</span>
              <span>+20% (Expansion)</span>
            </div>
          </div>

          {/* Slider 2: Transport Cost */}
          <div className="slider-block">
            <label>
              <span>Transportation &amp; Freight Cost Fluctuation</span>
              <span className="slider-value-pill" style={{ backgroundColor: transportChange > 0 ? "var(--color-avoid)" : transportChange < 0 ? "var(--color-expand)" : "var(--color-navy)" }}>
                {transportChange > 0 ? "+" : ""}{transportChange}%
              </span>
            </label>
            <input
              type="range"
              min={-20}
              max={50}
              step={1}
              value={transportChange}
              onChange={(e) => setTransportChange(Number(e.target.value))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--color-text-muted)", marginTop: "6px" }}>
              <span>-20% (Optimized Transit)</span>
              <span>0% (Baseline)</span>
              <span>+50% (Fuel &amp; Toll Surge)</span>
            </div>
          </div>

          <button className="btn btn-primary" onClick={runScenario} disabled={loading} style={{ width: "100%", marginTop: "10px" }}>
            {loading ? "Recalculating Scenario…" : "Recalculate Scenario"}
          </button>
        </div>

        {/* Selected State Before vs After Scorecard */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h2 className="card-title" style={{ fontSize: "16px", marginBottom: "16px" }}>
              {activeState} Impact Scorecard
            </h2>

            {error && (
              <div style={{ padding: "12px", background: "#fef2f2", color: "var(--color-avoid)", borderRadius: "8px", fontSize: "13px" }}>
                {error}
              </div>
            )}

            {result && !error && (
              <div className="comparison-container">
                <div className="comparison-box">
                  <div className="comparison-card">
                    <div className="label">Baseline Score</div>
                    <div className="value" style={{ marginTop: "4px" }}>{result.original_score}</div>
                    <div style={{ marginTop: "8px" }}>
                      <span className={`badge badge-${result.original_recommendation}`}>
                        {result.original_recommendation}
                      </span>
                    </div>
                  </div>

                  <div className="comparison-card" style={{ border: "1.5px solid var(--color-teal)", background: "var(--color-teal-light)" }}>
                    <div className="label" style={{ color: "var(--color-teal-hover)" }}>Scenario Score</div>
                    <div className="value" style={{ marginTop: "4px", color: "var(--color-navy)" }}>{result.scenario_score}</div>
                    <div style={{ marginTop: "8px" }}>
                      <span className={`badge badge-${result.scenario_recommendation}`}>
                        {result.scenario_recommendation}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="change-metric-box">
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)", letterSpacing: "0.5px" }}>
                    Net Score Delta
                  </div>
                  <div
                    className={result.change >= 0 ? "change-positive" : "change-negative"}
                    style={{ fontSize: "28px", fontWeight: 800, marginTop: "2px" }}
                  >
                    {result.change > 0 ? "+" : ""}{result.change} pts
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                    {result.explanation}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              padding: "12px 16px",
              background: "var(--color-surface-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              fontSize: "12px",
              color: "var(--color-text-muted)",
              marginTop: "20px",
            }}
          >
            <strong>Simulation Note:</strong> What-If scenarios are strictly temporary recalculations.
            Your baseline market analysis results remain intact and unmodified.
          </div>
        </div>
      </div>

      {/* Scenario Top 3 State Rankings (Section 3 Requirement) */}
      {result?.scenario_top_markets?.length > 0 && (
        <div className="card">
          <div className="card-header-clean">
            <div>
              <h2 className="card-title" style={{ fontSize: "18px" }}>
                Scenario Top 3 State Rankings
              </h2>
              <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                How the top recommended markets shift under this specific demand and transportation scenario.
              </div>
            </div>
            <span className="badge badge-teal" style={{ fontSize: "11px" }}>
              Updated Rankings
            </span>
          </div>

          <div className="market-grid">
            {result.scenario_top_markets.map((sm, idx) => (
              <div key={sm.state} className="market-card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="rank-badge">
                      Scenario #{idx + 1}
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--color-navy)", marginTop: "6px" }}>
                      {sm.state}
                    </div>
                    <div style={{ marginTop: "4px" }}>
                      <span className={`badge badge-${sm.recommendation}`}>
                        {sm.recommendation}
                      </span>
                    </div>
                  </div>

                  <div className="score-display">
                    <div className="score-big" style={{ fontSize: "32px" }}>{sm.market_fit_score}</div>
                    <div className="score-label">Scenario Score</div>
                  </div>
                </div>

                <div style={{ fontSize: "12.5px", color: "var(--color-text-secondary)", marginTop: "10px", lineHeight: 1.4 }}>
                  Adjusted Demand: <strong>{sm.demand}</strong> &bull; Effective Logistics: <strong>{sm.logistics}</strong>
                </div>

                <button
                  className="btn btn-secondary"
                  style={{ width: "100%", marginTop: "12px", fontSize: "12.5px" }}
                  onClick={() => setSelectedState(sm.state)}
                >
                  <span>Select {sm.state} as Target</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* States Moving Up / Down in Ranking (Section 3 Requirement) */}
      {result?.rank_changes?.length > 0 && (
        <div className="card">
          <h2 className="card-title" style={{ fontSize: "18px", marginBottom: "4px" }}>
            State Ranking Movers &amp; Shift Rationale
          </h2>
          <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "16px" }}>
            Full breakdown showing which states moved up, fell, or held rank under this simulated scenario.
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>Original Rank</th>
                  <th>Scenario Rank</th>
                  <th>Movement</th>
                  <th>Original Score</th>
                  <th>Scenario Score</th>
                  <th>Score Delta</th>
                  <th>Status</th>
                  <th>Shift Rationale</th>
                </tr>
              </thead>
              <tbody>
                {result.rank_changes.map((item) => {
                  const movedUp = item.rank_delta > 0;
                  const movedDown = item.rank_delta < 0;
                  return (
                    <tr key={item.state} style={{ background: item.state === activeState ? "var(--color-teal-light)" : "inherit" }}>
                      <td style={{ fontWeight: 700, color: "var(--color-navy)" }}>{item.state}</td>
                      <td>#{item.original_rank}</td>
                      <td style={{ fontWeight: 700 }}>#{item.scenario_rank}</td>
                      <td>
                        {movedUp ? (
                          <span style={{ color: "var(--color-expand)", fontWeight: 700 }}>
                            ↑ +{item.rank_delta} spot(s)
                          </span>
                        ) : movedDown ? (
                          <span style={{ color: "var(--color-avoid)", fontWeight: 700 }}>
                            ↓ {item.rank_delta} spot(s)
                          </span>
                        ) : (
                          <span style={{ color: "var(--color-text-muted)" }}>— Unchanged</span>
                        )}
                      </td>
                      <td>{item.original_score}</td>
                      <td style={{ fontWeight: 700 }}>{item.scenario_score}</td>
                      <td style={{ fontWeight: 700, color: item.score_delta >= 0 ? "var(--color-expand)" : "var(--color-avoid)" }}>
                        {item.score_delta > 0 ? `+${item.score_delta}` : item.score_delta}
                      </td>
                      <td>
                        <span className={`badge badge-${item.scenario_recommendation}`} style={{ fontSize: "10px" }}>
                          {item.scenario_recommendation}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                        {item.shift_reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Navigation Actions */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          padding: "18px 24px",
        }}
      >
        <button className="btn btn-secondary" onClick={() => navigate("/market-details")}>
          <ArrowLeftIcon size={16} />
          <span>Back to Market Details</span>
        </button>

        <button className="btn btn-teal" onClick={() => navigate("/strategy")}>
          <span>Continue to Market Entry Strategy</span>
          <ArrowRightIcon size={16} />
        </button>
      </div>
    </div>
  );
}
