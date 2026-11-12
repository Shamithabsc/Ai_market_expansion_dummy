import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { getStrategy } from "../services/api";
import {
  StrategyIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  TargetIcon,
  BuildingIcon,
  RupeeIcon,
  RefreshIcon,
  PackageIcon,
  MapPinIcon,
} from "../components/Icons";

export default function Strategy() {
  const navigate = useNavigate();
  const { selectedState, setSelectedState, msme, analysis, resetAll } = useAppContext();

  const activeState = selectedState || (analysis?.top_markets?.length > 0 ? analysis.top_markets[0].state : null);

  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!activeState) {
      navigate("/recommendations");
      return;
    }

    setLoading(true);
    setError("");

    getStrategy(activeState, {
      ...msme,
      selling_price: Number(msme.selling_price || 0),
      production_capacity: Number(msme.production_capacity || 0),
      expansion_budget: Number(msme.expansion_budget || 0),
    })
      .then((data) => {
        setStrategy(data);
        if (!selectedState) setSelectedState(activeState);
      })
      .catch((err) => setError(err.message || "Failed to load market entry strategy"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeState]);

  const handleStateChange = (newState) => {
    setSelectedState(newState);
  };

  const copyStrategySummary = () => {
    if (!strategy) return;
    const text =
      `MARKET ENTRY STRATEGY — ${strategy.state} (${strategy.recommendation})\n` +
      `Product: ${msme.product_name} | Target Customer: ${strategy.target_customer} | Budget: ₹${Number(msme.expansion_budget).toLocaleString('en-IN')}\n\n` +
      `1. RECOMMENDED APPROACH:\n${strategy.recommended_approach}\n\n` +
      `2. SUGGESTED BUDGET ALLOCATION:\n` +
      (strategy.budget_allocation?.map((b) => `• ${b.category} (${b.percentage}%): ₹${b.amount.toLocaleString('en-IN')} - ${b.rationale}`).join("\n") || "") +
      `\n\n3. DISTRIBUTION CHANNELS:\n` +
      (strategy.suggested_channels?.map((c, i) => `${i + 1}. ${c}`).join("\n") || "") +
      `\n\n4. PRICING CONSIDERATION:\n${strategy.pricing_consideration}\n\n` +
      `5. INITIAL LAUNCH STEPS:\n` +
      (strategy.initial_launch_steps?.map((s, i) => `${i + 1}. ${s}`).join("\n") || "") +
      `\n\n6. KEY RISKS:\n` +
      (strategy.key_risks?.map((r, i) => `• ${r}`).join("\n") || "");

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="card loading-box">
        <div className="spinner" />
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-navy)", margin: "0 0 6px" }}>
          Generating Market Entry Strategy…
        </h2>
        <div style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
          Tailoring distribution channels, investment allocations, and phased execution roadmaps for {activeState}
        </div>
      </div>
    );
  }

  if (error || !strategy) {
    return (
      <div className="card empty-state">
        <div className="empty-state-icon" style={{ backgroundColor: "#fee2e2", color: "var(--color-avoid)" }}>
          <AlertTriangleIcon size={26} />
        </div>
        <div className="empty-state-title">Strategy Generation Error</div>
        <div className="empty-state-desc">{error || "Could not generate strategy for the selected state."}</div>
        <button className="btn btn-secondary" onClick={() => navigate("/recommendations")}>
          <ArrowLeftIcon size={16} />
          <span>Back to Recommendations</span>
        </button>
      </div>
    );
  }

  const totalBudget = Number(msme.expansion_budget || 200000);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Card */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span className="badge badge-teal" style={{ fontSize: "11px" }}>
                Step 6: Go-To-Market Execution Plan
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
                        {market.state} ({market.recommendation})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <h1 className="section-title" style={{ fontSize: "26px", margin: 0 }}>
                Go-To-Market Entry Strategy &mdash; {strategy.state}
              </h1>
              <span className={`badge badge-${strategy.recommendation}`}>
                {strategy.recommendation}
              </span>
            </div>

            <div style={{ fontSize: "13.5px", color: "var(--color-text-muted)", marginTop: "6px" }}>
              Practical recommendations calibrated for <strong>{msme.product_name}</strong> &bull; Total Allocated Budget: <strong>₹{totalBudget.toLocaleString("en-IN")}</strong>
            </div>
          </div>

          <button
            className="btn btn-secondary"
            onClick={copyStrategySummary}
            style={{ fontSize: "13px" }}
            title="Copy plain-text executive brief to clipboard"
          >
            {copied ? (
              <>
                <CheckCircleIcon size={14} style={{ color: "var(--color-expand)" }} />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <StrategyIcon size={14} />
                <span>Copy Executive Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggested Initial Investment Allocation (Section 4 Requirement) */}
      {strategy.budget_allocation?.length > 0 && (
        <div className="card">
          <div className="card-header-clean">
            <div>
              <h2 className="card-title" style={{ fontSize: "18px" }}>
                Suggested Initial Investment Allocation (Budget: ₹{totalBudget.toLocaleString("en-IN")})
              </h2>
              <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                Capital deployment breakdown tailored to the {strategy.target_customer} distribution model in {strategy.state}.
              </div>
            </div>
            <span className="badge badge-teal" style={{ fontSize: "11px" }}>
              Capital Allocation
            </span>
          </div>

          {/* Allocation Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "14px",
              marginTop: "8px",
            }}
          >
            {strategy.budget_allocation.map((item) => (
              <div
                key={item.category}
                style={{
                  background: "var(--color-surface-subtle)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                    {item.percentage}% of Budget
                  </span>
                  <span style={{ fontSize: "17px", fontWeight: 800, color: "var(--color-navy)" }}>
                    ₹{item.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-navy)" }}>
                  {item.category}
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
                  {item.rationale}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two-Column Strategic Blueprint */}
      <div className="two-col">
        {/* Left Column: Approach, Channels & Pricing */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Approach Card */}
          <div className="strategy-block">
            <div className="strategy-block-header">
              <TargetIcon size={18} style={{ color: "var(--color-teal)" }} />
              <span>Recommended Entry Approach</span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "0 0 16px" }}>
              {strategy.recommended_approach}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                background: "var(--color-surface-subtle)",
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                  Target Customer Segment
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-navy)", marginTop: "2px" }}>
                  {strategy.target_customer}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                  Target State
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-navy)", marginTop: "2px" }}>
                  {strategy.state}
                </div>
              </div>
            </div>
          </div>

          {/* Distribution & Logistics Considerations */}
          <div className="strategy-block">
            <div className="strategy-block-header">
              <BuildingIcon size={18} style={{ color: "var(--color-teal)" }} />
              <span>Distribution &amp; Logistics Channels</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {strategy.suggested_channels?.map((channel, i) => (
                <div
                  key={channel}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "var(--color-surface-subtle)",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    color: "var(--color-navy)",
                  }}
                >
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-teal-light)",
                      color: "var(--color-teal)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span>{channel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Margin Considerations */}
          <div className="strategy-block">
            <div className="strategy-block-header">
              <RupeeIcon size={18} style={{ color: "var(--color-teal)" }} />
              <span>Pricing &amp; Margin Strategy</span>
            </div>
            <p style={{ fontSize: "13.5px", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
              {strategy.pricing_consideration}
            </p>
          </div>
        </div>

        {/* Right Column: Phased Launch Steps & Key Risks */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Phased Roadmap */}
          <div className="strategy-block">
            <div className="strategy-block-header">
              <PackageIcon size={18} style={{ color: "var(--color-navy)" }} />
              <span>Phased 90-Day Launch Roadmap</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {strategy.initial_launch_steps?.map((step, idx) => (
                <div
                  key={step}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "12px 14px",
                    background: "#f8fafc",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-navy)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 800,
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Operational Risks */}
          <div className="strategy-block">
            <div className="strategy-block-header" style={{ color: "var(--color-avoid)" }}>
              <AlertTriangleIcon size={18} />
              <span>Key Operational Risks &amp; Watchpoints</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {strategy.key_risks?.map((risk) => (
                <div
                  key={risk}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#991b1b",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ fontWeight: 800 }}>•</span>
                  <span>{risk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Global Bottom Navigation */}
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
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-secondary" onClick={() => navigate("/what-if")}>
            <ArrowLeftIcon size={16} />
            <span>Back to What-If</span>
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/recommendations")}>
            <span>Back to Recommendations</span>
          </button>
        </div>

        <button
          className="btn btn-teal"
          onClick={() => {
            resetAll();
            navigate("/");
          }}
        >
          <RefreshIcon size={14} />
          <span>Start New Analysis</span>
        </button>
      </div>

      {/* Transparency Banner */}
      <div className="disclaimer-banner">
        <InfoIcon size={18} style={{ color: "var(--color-teal)", flexShrink: 0 }} />
        <div>
          <strong>Rule-Based Strategy Engine:</strong> This go-to-market plan and budget allocation are generated using
          deterministic MSME expansion heuristics and market factor weights. No black-box generative AI is claimed or used.
        </div>
      </div>
    </div>
  );
}
