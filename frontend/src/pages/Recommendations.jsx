import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import {
  TargetIcon,
  SparklesIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SlidersIcon,
  BarChartIcon,
  InfoIcon,
  BuildingIcon,
  RefreshIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  LayersIcon,
} from "../components/Icons";

export default function Recommendations() {
  const navigate = useNavigate();
  const { analysis, msme, setSelectedState, resetAll } = useAppContext();
  const [filter, setFilter] = useState("ALL");
  const [showAllTable, setShowAllTable] = useState(false);
  const [showComparison, setShowComparison] = useState(true);

  if (!analysis || !analysis.top_markets || analysis.top_markets.length === 0) {
    return (
      <div className="card empty-state">
        <div className="empty-state-icon">
          <TargetIcon size={28} />
        </div>
        <div className="empty-state-title">No Active Market Analysis Available</div>
        <div className="empty-state-desc">
          To receive customized Indian state recommendations, enter your MSME parameters and run an analysis.
        </div>
        <button className="btn btn-teal" onClick={() => navigate("/business-details")}>
          <span>Start Market Analysis</span>
          <ArrowRightIcon size={16} />
        </button>
      </div>
    );
  }

  const top3 = analysis.top_markets.slice(0, 3);

  const goToDetails = (state) => {
    setSelectedState(state);
    navigate("/market-details");
  };

  const goToWhatIf = (state) => {
    setSelectedState(state);
    navigate("/what-if");
  };

  const goToStrategy = (state) => {
    setSelectedState(state);
    navigate("/strategy");
  };

  const filteredAllMarkets = (analysis.all_markets || []).filter((m) => {
    if (filter === "ALL") return true;
    return m.recommendation === filter;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Context Summary Header */}
      <div
        className="card"
        style={{
          padding: "18px 24px",
          background: "var(--color-surface)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Analyzed Offering
            </div>
            <div style={{ fontSize: "17px", fontWeight: 800, color: "var(--color-navy)" }}>
              {msme.product_name || "Millet Crunch Snacks"}
            </div>
          </div>
          <div style={{ height: "30px", width: "1px", backgroundColor: "var(--color-border)" }} />
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Category &amp; Subcategory
            </div>
            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--color-teal)" }}>
              {analysis.categorization?.category || msme.product_category}
              {analysis.categorization?.subcategory && (
                <span style={{ color: "var(--color-text-muted)", fontWeight: 500 }}>
                  {" "}• {analysis.categorization.subcategory}
                </span>
              )}
            </div>
          </div>
          <div style={{ height: "30px", width: "1px", backgroundColor: "var(--color-border)" }} />
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Base State &amp; Model
            </div>
            <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--color-navy)" }}>
              {msme.current_state} &bull; {msme.target_customer}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn btn-secondary"
            style={{ fontSize: "12.5px", padding: "6px 12px" }}
            onClick={() => navigate("/categorization")}
          >
            <span>Review Category</span>
          </button>
          <button
            className="btn btn-secondary"
            style={{ fontSize: "12.5px", padding: "6px 12px" }}
            onClick={() => navigate("/business-details")}
          >
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Comparative Ranking Narrative (Section 2 Requirement) */}
      {analysis.comparative_summary && (
        <div
          className="card"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#ffffff",
            padding: "20px 24px",
            border: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#2dd4bf", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
            <SparklesIcon size={14} />
            <span>Comparative Ranking Analysis</span>
          </div>
          <p style={{ fontSize: "14.5px", lineHeight: 1.6, color: "#e2e8f0", margin: 0 }}>
            {analysis.comparative_summary}
          </p>
        </div>
      )}

      {/* Top 3 Market Cards (Step 5) */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h1 className="section-title" style={{ fontSize: "20px" }}>
              Top 3 Recommended Expansion Markets
            </h1>
            <div className="section-sub" style={{ margin: 0 }}>
              Ranked by composite Market Fit Score with factor breakdowns, opportunities, risks, and MSME suitability.
            </div>
          </div>

          <button
            className="btn btn-secondary"
            style={{ fontSize: "13px", padding: "6px 12px" }}
            onClick={() => setShowComparison(!showComparison)}
          >
            <LayersIcon size={14} />
            <span>{showComparison ? "Hide Side-by-Side Comparison" : "Show Side-by-Side Comparison"}</span>
          </button>
        </div>

        <div className="market-grid">
          {top3.map((m, idx) => {
            const isTop = idx === 0;
            const compSuit = m.competition_suitability ?? (100 - m.competition);
            return (
              <div
                key={m.state}
                className={`market-card ${isTop ? "rank-1" : ""}`}
                style={{ padding: "24px" }}
              >
                {/* Card Header: Rank, State, Status Badge, Score */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className={`rank-badge ${isTop ? "top-pick" : ""}`}>
                      {idx === 0 ? "★ Rank #1 Top Target" : `#${idx + 1} Contender`}
                    </div>
                    <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--color-navy)", marginTop: "8px" }}>
                      {m.state}
                    </div>
                    <div style={{ marginTop: "4px" }}>
                      <span className={`badge badge-${m.recommendation}`}>
                        {m.recommendation}
                      </span>
                    </div>
                  </div>

                  <div className="score-display">
                    <div className="score-big">{m.market_fit_score}</div>
                    <div className="score-label">Fit Score</div>
                  </div>
                </div>

                {/* Factor-Wise Progress Bars */}
                <div className="factors-list">
                  <div className="factor-item">
                    <div className="factor-item-header">
                      <span>Demand Score</span>
                      <span style={{ fontWeight: 600 }}>{m.demand} / 100</span>
                    </div>
                    <div className="factor-bar-bg">
                      <div className="factor-bar-fill" style={{ width: `${m.demand}%` }} />
                    </div>
                  </div>

                  <div className="factor-item">
                    <div className="factor-item-header">
                      <span>Market Growth Trend</span>
                      <span style={{ fontWeight: 600 }}>{m.market_growth} / 100</span>
                    </div>
                    <div className="factor-bar-bg">
                      <div className="factor-bar-fill" style={{ width: `${m.market_growth}%` }} />
                    </div>
                  </div>

                  <div className="factor-item">
                    <div className="factor-item-header">
                      <span>Competition Suitability (Inverted)</span>
                      <span style={{ fontWeight: 600, color: "var(--color-teal)" }}>{compSuit} / 100</span>
                    </div>
                    <div className="factor-bar-bg">
                      <div className="factor-bar-fill" style={{ width: `${compSuit}%`, background: "var(--color-teal)" }} />
                    </div>
                  </div>

                  <div className="factor-item">
                    <div className="factor-item-header">
                      <span>Purchasing Power</span>
                      <span style={{ fontWeight: 600 }}>{m.purchasing_power} / 100</span>
                    </div>
                    <div className="factor-bar-bg">
                      <div className="factor-bar-fill" style={{ width: `${m.purchasing_power}%` }} />
                    </div>
                  </div>

                  <div className="factor-item">
                    <div className="factor-item-header">
                      <span>Logistics &amp; Infrastructure</span>
                      <span style={{ fontWeight: 600 }}>{m.logistics} / 100</span>
                    </div>
                    <div className="factor-bar-bg">
                      <div className="factor-bar-fill" style={{ width: `${m.logistics}%` }} />
                    </div>
                  </div>

                  <div className="factor-item">
                    <div className="factor-item-header">
                      <span>Market Accessibility</span>
                      <span style={{ fontWeight: 600 }}>{m.accessibility} / 100</span>
                    </div>
                    <div className="factor-bar-bg">
                      <div className="factor-bar-fill" style={{ width: `${m.accessibility}%` }} />
                    </div>
                  </div>
                </div>

                {/* Main Reasons & Opportunities */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px" }}>
                  <div style={{ fontWeight: 700, color: "var(--color-navy)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <CheckCircleIcon size={14} style={{ color: "var(--color-expand)" }} />
                    <span>Primary Recommendation Reasons:</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "18px", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
                    {(m.key_reasons || []).slice(0, 2).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>

                  {m.potential_risks?.length > 0 && (
                    <div style={{ marginTop: "4px" }}>
                      <div style={{ fontWeight: 700, color: "var(--color-avoid)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <AlertTriangleIcon size={14} />
                        <span>Potential Risks:</span>
                      </div>
                      <div style={{ color: "#991b1b", fontSize: "12px", marginTop: "2px", lineHeight: 1.4 }}>
                        {m.potential_risks[0]}
                      </div>
                    </div>
                  )}
                </div>

                {/* MSME Suitability Matrix */}
                {m.msme_suitability && (
                  <div
                    style={{
                      background: "var(--color-surface-subtle)",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-md)",
                      fontSize: "12px",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "6px",
                    }}
                  >
                    <div><strong>Budget Fit:</strong> {m.msme_suitability.budget_fit}</div>
                    <div><strong>Price Acceptance:</strong> {m.msme_suitability.price_acceptance}</div>
                    <div><strong>Capacity Match:</strong> {m.msme_suitability.capacity_utilization}</div>
                    <div><strong>Model:</strong> {m.msme_suitability.channel_type}</div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto" }}>
                  <button
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "space-between" }}
                    onClick={() => goToDetails(m.state)}
                  >
                    <span>View Market Diagnostics &amp; Why It Ranked</span>
                    <ArrowRightIcon size={16} />
                  </button>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: "12.5px", padding: "8px" }}
                      onClick={() => goToWhatIf(m.state)}
                    >
                      <SlidersIcon size={14} />
                      <span>What-If</span>
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: "12.5px", padding: "8px" }}
                      onClick={() => goToStrategy(m.state)}
                    >
                      <TargetIcon size={14} />
                      <span>Entry Strategy</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 6: Side-by-Side Market Comparison */}
      {showComparison && (
        <div className="card">
          <div className="card-header-clean">
            <div>
              <h2 className="card-title" style={{ fontSize: "18px" }}>
                Step 6: Top 3 State Comparison Matrix
              </h2>
              <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                Side-by-side indicator benchmarking designed for non-technical business decision making.
              </div>
            </div>
            <span className="badge badge-teal" style={{ fontSize: "11px" }}>
              Direct Comparison
            </span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "22%" }}>Evaluation Parameter</th>
                  {top3.map((m, idx) => (
                    <th key={m.state} style={{ width: "26%", background: idx === 0 ? "var(--color-teal-light)" : "inherit" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 800, color: "var(--color-navy)", fontSize: "15px" }}>
                          #{idx + 1} {m.state}
                        </span>
                        <span className={`badge badge-${m.recommendation}`} style={{ fontSize: "10px" }}>
                          {m.recommendation}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 700 }}>Market Fit Score</td>
                  {top3.map((m, idx) => (
                    <td key={m.state} style={{ fontWeight: 800, fontSize: "18px", color: idx === 0 ? "var(--color-teal-hover)" : "var(--color-navy)" }}>
                      {m.market_fit_score} / 100
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Customer Demand</td>
                  {top3.map((m) => (
                    <td key={m.state}>{m.demand} / 100</td>
                  ))}
                </tr>
                <tr>
                  <td>Market Growth Trend</td>
                  {top3.map((m) => (
                    <td key={m.state}>{m.market_growth} / 100</td>
                  ))}
                </tr>
                <tr>
                  <td>Competition Suitability (100 - Comp)</td>
                  {top3.map((m) => {
                    const cSuit = m.competition_suitability ?? (100 - m.competition);
                    return (
                      <td key={m.state} style={{ fontWeight: 600, color: "var(--color-teal)" }}>
                        {cSuit} / 100 <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>({m.competition} raw comp)</span>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td>Retail Purchasing Power</td>
                  {top3.map((m) => (
                    <td key={m.state}>{m.purchasing_power} / 100</td>
                  ))}
                </tr>
                <tr>
                  <td>Logistics &amp; Infrastructure</td>
                  {top3.map((m) => (
                    <td key={m.state}>{m.logistics} / 100</td>
                  ))}
                </tr>
                <tr>
                  <td>Trade Accessibility</td>
                  {top3.map((m) => (
                    <td key={m.state}>{m.accessibility} / 100</td>
                  ))}
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Key Advantage</td>
                  {top3.map((m) => (
                    <td key={m.state} style={{ fontSize: "12.5px", color: "var(--color-text-secondary)" }}>
                      {m.key_reasons?.[0] || "Balanced viability"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Action</td>
                  {top3.map((m) => (
                    <td key={m.state}>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: "12px", padding: "5px 10px" }}
                        onClick={() => goToDetails(m.state)}
                      >
                        Deep Diagnostics →
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full 15 Evaluated Markets Table */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 className="card-title" style={{ fontSize: "18px" }}>
              All {(analysis.all_markets || []).length} Evaluated Indian State Markets
            </h2>
            <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "2px" }}>
              Comprehensive dataset scoring with transparent Expand, Pilot, and Avoid thresholds.
            </div>
          </div>

          <button
            className={`btn ${showAllTable ? "btn-secondary" : "btn-teal"}`}
            style={{ fontSize: "13px", padding: "6px 14px" }}
            onClick={() => setShowAllTable(!showAllTable)}
          >
            {showAllTable ? "Collapse Full Table" : `View Full ${(analysis.all_markets || []).length}-State Table`}
          </button>
        </div>

        {showAllTable && (
          <div style={{ marginTop: "18px" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
              {["ALL", "EXPAND", "PILOT", "AVOID"].map((f) => (
                <button
                  key={f}
                  className={`btn ${filter === f ? "btn-primary" : "btn-secondary"}`}
                  style={{ fontSize: "12px", padding: "5px 12px", borderRadius: "16px" }}
                  onClick={() => setFilter(f)}
                >
                  {f === "ALL" ? `All ${analysis.all_markets.length} States` : `${f} (${analysis.all_markets.filter(m => m.recommendation === f).length})`}
                </button>
              ))}
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>State</th>
                    <th>Fit Score</th>
                    <th>Recommendation</th>
                    <th>Demand</th>
                    <th>Growth</th>
                    <th>Comp Suitability</th>
                    <th>Purchasing Power</th>
                    <th>Logistics</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAllMarkets.map((m, idx) => (
                    <tr key={m.state}>
                      <td style={{ fontWeight: 700, color: "var(--color-navy)" }}>#{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{m.state}</td>
                      <td>
                        <span style={{ fontWeight: 800, color: "var(--color-navy)", fontSize: "14px" }}>
                          {m.market_fit_score}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${m.recommendation}`} style={{ fontSize: "10.5px" }}>
                          {m.recommendation}
                        </span>
                      </td>
                      <td>{m.demand}</td>
                      <td>{m.market_growth}</td>
                      <td>{m.competition_suitability ?? (100 - m.competition)}</td>
                      <td>{m.purchasing_power}</td>
                      <td>{m.logistics}</td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: "11.5px", padding: "4px 8px" }}
                          onClick={() => goToDetails(m.state)}
                        >
                          Diagnose
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Global Actions */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          padding: "16px 24px",
        }}
      >
        <button className="btn btn-secondary" onClick={() => navigate("/categorization")}>
          <ArrowLeftIcon size={16} />
          <span>Back to Categorization</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => {
            resetAll();
            navigate("/business-details");
          }}
        >
          <RefreshIcon size={14} />
          <span>Start Fresh Analysis</span>
        </button>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer-banner">
        <InfoIcon size={18} style={{ color: "var(--color-teal)", flexShrink: 0 }} />
        <div>{analysis.disclaimer}</div>
      </div>
    </div>
  );
}
