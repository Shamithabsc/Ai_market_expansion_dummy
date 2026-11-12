import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { useAppContext } from "../context/AppContext";
import { getMarketDetail } from "../services/api";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  SlidersIcon,
  TargetIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  BarChartIcon,
  RadarIcon,
  MapPinIcon,
  BuildingIcon,
  PackageIcon,
} from "../components/Icons";

export default function MarketDetails() {
  const navigate = useNavigate();
  const { selectedState, setSelectedState, msme, analysis } = useAppContext();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartType, setChartType] = useState("bar");

  const activeState = selectedState || (analysis?.top_markets?.length > 0 ? analysis.top_markets[0].state : null);

  useEffect(() => {
    if (!activeState) {
      navigate("/recommendations");
      return;
    }

    setLoading(true);
    setError("");

    getMarketDetail(activeState, {
      ...msme,
      selling_price: Number(msme.selling_price || 0),
      production_capacity: Number(msme.production_capacity || 0),
      expansion_budget: Number(msme.expansion_budget || 0),
    })
      .then((data) => {
        setDetail(data);
        if (!selectedState) setSelectedState(activeState);
      })
      .catch((err) => setError(err.message || "Failed to load market diagnostics"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeState]);

  if (loading) {
    return (
      <div className="card loading-box">
        <div className="spinner" />
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-navy)", margin: "0 0 6px" }}>
          Generating Explainable Market Diagnostics…
        </h2>
        <div style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
          Analyzing economic drivers, score deductions, and MSME suitability alignment for {activeState}
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="card empty-state">
        <div className="empty-state-icon" style={{ backgroundColor: "#fee2e2", color: "var(--color-avoid)" }}>
          <AlertTriangleIcon size={26} />
        </div>
        <div className="empty-state-title">Diagnostics Unavailable</div>
        <div className="empty-state-desc">{error || "Could not retrieve diagnostic records for this state."}</div>
        <button className="btn btn-secondary" onClick={() => navigate("/recommendations")}>
          <ArrowLeftIcon size={16} />
          <span>Back to Recommendations</span>
        </button>
      </div>
    );
  }

  const m = detail.market;
  const compSuit = m.competition_suitability ?? (100 - m.competition);

  const chartData = [
    { factor: "Demand (30%)", value: m.demand, weight: "30%" },
    { factor: "Growth (15%)", value: m.market_growth, weight: "15%" },
    { factor: "Comp. Suit. (15%)", value: compSuit, weight: "15%" },
    { factor: "Purch. Power (15%)", value: m.purchasing_power, weight: "15%" },
    { factor: "Logistics (15%)", value: m.logistics, weight: "15%" },
    { factor: "Access. (10%)", value: m.accessibility, weight: "10%" },
  ];

  const handleStateChange = (newState) => {
    setSelectedState(newState);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* State Header Card */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-teal)" }}>
                <MapPinIcon size={18} />
                <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Detailed Market Diagnostics
                </span>
              </div>

              {analysis?.all_markets && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Switch State:</span>
                  <select
                    value={activeState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="form-select"
                    style={{ padding: "4px 10px", fontSize: "13px", width: "auto" }}
                  >
                    {analysis.all_markets.map((market) => (
                      <option key={market.state} value={market.state}>
                        {market.state} ({market.recommendation} - {market.market_fit_score})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
              <h1 className="section-title" style={{ fontSize: "28px", margin: 0 }}>
                {m.state} Market Assessment
              </h1>
              <span className={`badge badge-${m.recommendation}`} style={{ fontSize: "13px", padding: "4px 12px" }}>
                {m.recommendation}
              </span>
            </div>

            <div style={{ fontSize: "13.5px", color: "var(--color-text-muted)", marginTop: "6px" }}>
              Evaluating expansion for <strong>{msme.product_name}</strong> from <strong>{msme.current_state}</strong> &bull; Model: <strong>{msme.target_customer}</strong>
            </div>
          </div>

          {/* Score Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              background: "var(--color-surface-subtle)",
              padding: "12px 20px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                Calculated Market Fit Score
              </div>
              <div className="score-big" style={{ fontSize: "38px", color: "var(--color-navy)" }}>
                {m.market_fit_score} <span style={{ fontSize: "18px", color: "var(--color-text-muted)" }}>/ 100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ranking Rationale & Explainability Banner (Section 2) */}
      {detail.ranking_rationale && (
        <div
          className="card"
          style={{
            background: "#f0fdfa",
            border: "1.5px solid #99f6e4",
            padding: "18px 22px",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "var(--color-teal-hover)", letterSpacing: "0.5px", marginBottom: "4px" }}>
            Why This State Holds This Ranking
          </div>
          <p style={{ fontSize: "14px", color: "var(--color-navy)", lineHeight: 1.6, margin: 0 }}>
            {detail.ranking_rationale}
          </p>
        </div>
      )}

      {/* Main Two-Column Analytics */}
      <div className="two-col">
        {/* Left Column: Visual Factor Distribution Chart */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h2 className="card-title" style={{ fontSize: "16px" }}>
                Factor-Wise Score Distribution
              </h2>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                Formula weights: Demand (30%), Growth (15%), Purchasing Power (15%), Logistics (15%), Comp. Suitability (15%), Access (10%).
              </div>
            </div>

            <div style={{ display: "flex", background: "var(--color-surface-subtle)", borderRadius: "var(--radius-md)", padding: "2px", border: "1px solid var(--color-border)" }}>
              <button
                className={`btn btn-ghost ${chartType === "bar" ? "btn-primary" : ""}`}
                style={{ padding: "4px 10px", fontSize: "12px", borderRadius: "6px" }}
                onClick={() => setChartType("bar")}
              >
                <BarChartIcon size={14} />
                <span>Bar</span>
              </button>
              <button
                className={`btn btn-ghost ${chartType === "radar" ? "btn-primary" : ""}`}
                style={{ padding: "4px 10px", fontSize: "12px", borderRadius: "6px" }}
                onClick={() => setChartType("radar")}
              >
                <RadarIcon size={14} />
                <span>Radar</span>
              </button>
            </div>
          </div>

          <div style={{ height: 280, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="factor" tick={{ fontSize: 10.5, fill: "#475569" }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#ffffff",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} name="Score" />
                </BarChart>
              ) : (
                <RadarChart outerRadius={85} data={chartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="factor" tick={{ fontSize: 10.5, fill: "#334155" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                  <Radar name="Market Factor" dataKey="value" stroke="#0d9488" fill="#14b8a6" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", color: "#ffffff", borderRadius: "8px" }} />
                </RadarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Factor Details Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
              marginTop: "16px",
              paddingTop: "14px",
              borderTop: "1px solid var(--color-border-subtle)",
            }}
          >
            {chartData.map((item) => (
              <div
                key={item.factor}
                style={{
                  background: "var(--color-surface-subtle)",
                  padding: "8px 10px",
                  borderRadius: "var(--radius-sm)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{item.factor}</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-navy)" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Narrative Rationale & Positive / Risk Breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Narrative Card */}
          <div className="card">
            <h2 className="card-title" style={{ fontSize: "16px", marginBottom: "8px" }}>
              Analytical Rationale &amp; Competition Inversion
            </h2>
            <p style={{ fontSize: "13.5px", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
              {detail.explanation}
            </p>
          </div>

          {/* Contributing Drivers & Score Reducers */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Contributing Positives */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: 700, color: "var(--color-expand)" }}>
                <CheckCircleIcon size={16} />
                <span>Contributing Positive Factors (Elevated Score)</span>
              </div>
              <div className="tag-list">
                {detail.positive_factors?.map((f) => (
                  <span className="tag" key={f}>
                    ✓ {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Score Reducers / Risks */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: 700, color: "var(--color-avoid)" }}>
                <AlertTriangleIcon size={16} />
                <span>Identified Score Reducers &amp; Risks</span>
              </div>
              <div className="tag-list">
                {detail.risks?.map((r) => (
                  <span className="tag risk" key={r}>
                    ⚠ {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* MSME Parameter Alignment Breakdown (Section 2 Requirement) */}
          {detail.msme_alignment && Object.keys(detail.msme_alignment).length > 0 && (
            <div className="card">
              <h2 className="card-title" style={{ fontSize: "15px", marginBottom: "8px" }}>
                MSME Parameter Adjustment Breakdown
              </h2>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "12px" }}>
                How your specific budget, pricing, capacity, and constraints adjusted the baseline score:
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px" }}>
                {Object.entries(detail.msme_alignment).map(([key, val]) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      background: val.applied ? (val.delta >= 0 ? "#f0fdf4" : "#fef2f2") : "var(--color-surface-subtle)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid",
                      borderColor: val.applied ? (val.delta >= 0 ? "#bbf7d0" : "#fecaca") : "var(--color-border)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--color-navy)" }}>{val.reason}</div>
                    </div>
                    {val.applied && (
                      <span style={{ fontWeight: 800, color: val.delta >= 0 ? "var(--color-expand)" : "var(--color-avoid)", marginLeft: "12px", whiteSpace: "nowrap" }}>
                        {val.delta >= 0 ? `+${val.delta}` : val.delta} pts
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Transparency & Methodology (Section 7) */}
      <div className="card" style={{ background: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <InfoIcon size={16} style={{ color: "var(--color-teal)" }} />
          <h2 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "var(--color-navy)" }}>
            Data Transparency &amp; Source Benchmark
          </h2>
        </div>
        <p style={{ fontSize: "12.5px", color: "var(--color-text-muted)", lineHeight: 1.5, margin: "0 0 8px" }}>
          {detail.data_sources}
        </p>
        <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontStyle: "italic" }}>
          {detail.data_vs_rules_note}
        </div>
      </div>

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
        <button className="btn btn-secondary" onClick={() => navigate("/recommendations")}>
          <ArrowLeftIcon size={16} />
          <span>Back to Recommendations</span>
        </button>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-secondary" onClick={() => navigate("/what-if")}>
            <SlidersIcon size={16} />
            <span>Simulate in What-If</span>
          </button>

          <button className="btn btn-teal" onClick={() => navigate("/strategy")}>
            <span>Market Entry Strategy</span>
            <ArrowRightIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
