import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import {
  SparklesIcon,
  ArrowRightIcon,
  BuildingIcon,
  InfoIcon,
  TargetIcon,
  BarChartIcon,
  PackageIcon,
} from "../components/Icons";
import { getDatasetMetadata } from "../services/api";

export default function Home() {
  const navigate = useNavigate();
  const { msme, analysis, loadSampleProfile } = useAppContext();
  const [datasetMeta, setDatasetMeta] = useState(null);

  useEffect(() => {
    getDatasetMetadata()
      .then(setDatasetMeta)
      .catch(() => setDatasetMeta(null));
  }, []);

  const hasAnalysis = Boolean(analysis && analysis.all_markets && analysis.all_markets.length > 0);
  const topMarket = hasAnalysis && analysis.top_markets?.length > 0 ? analysis.top_markets[0] : null;
  const avgFitScore = hasAnalysis
    ? (
        analysis.all_markets.reduce((acc, m) => acc + (m.market_fit_score || 0), 0) /
        analysis.all_markets.length
      ).toFixed(1)
    : null;

  // Real dataset counts (from /dataset-metadata) or sensible fallbacks while loading
  const statesCount = datasetMeta?.states_covered_count ?? (hasAnalysis ? analysis.all_markets.length : "—");
  const categoriesCount = datasetMeta?.available_categories_count ?? 6;
  const totalRecords = datasetMeta?.total_records ?? "—";
  const dataCompleteness = datasetMeta?.completeness_percentage ?? null;

  const handleStartAnalysis = () => {
    navigate("/business-details");
  };

  const handleLoadDemo = () => {
    loadSampleProfile();
    navigate("/business-details");
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Hero Card */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          padding: "36px 32px",
          border: "none",
        }}
      >
        <div style={{ maxWidth: "800px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(13, 148, 136, 0.2)",
              border: "1px solid rgba(20, 184, 166, 0.4)",
              color: "#2dd4bf",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "16px",
            }}
          >
            <SparklesIcon size={14} />
            <span>Intelligent MSME Market Intelligence Platform</span>
          </div>

          <h1
            style={{
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              margin: "0 0 14px",
              lineHeight: 1.25,
            }}
          >
            AI Market Expansion Advisor for MSMEs
          </h1>

          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.6,
              color: "#cbd5e1",
              margin: "0 0 24px",
              maxWidth: "700px",
            }}
          >
            Evaluating geographic expansion opportunities for Indian small and medium enterprises.
            The system combines multi-factor economic scoring—evaluating consumer demand, market growth,
            purchasing power, competitor saturation, logistics efficiency, and corridor accessibility—with
            transparent, explainable recommendations and temporary What-If scenario simulations.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <button
              className="btn btn-teal"
              style={{ padding: "11px 24px", fontSize: "15px", fontWeight: 700 }}
              onClick={handleStartAnalysis}
            >
              <span>Start New Market Analysis</span>
              <ArrowRightIcon size={16} />
            </button>

            {!hasAnalysis && (
              <button
                className="btn btn-secondary"
                style={{
                  padding: "11px 20px",
                  fontSize: "14px",
                  color: "#ffffff",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  background: "rgba(255, 255, 255, 0.08)",
                }}
                onClick={handleLoadDemo}
              >
                <span>Load Sample Business Profile</span>
              </button>
            )}

            {hasAnalysis && (
              <button
                className="btn btn-secondary"
                style={{
                  padding: "11px 20px",
                  fontSize: "14px",
                  color: "#ffffff",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  background: "rgba(255, 255, 255, 0.08)",
                }}
                onClick={() => navigate("/recommendations")}
              >
                <span>Revisit Latest Results ({topMarket?.state})</span>
                <ArrowRightIcon size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Useful Summary Cards (Step 1) */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <h2 className="section-title" style={{ fontSize: "17px" }}>Platform Analytical Overview</h2>
            <div className="section-sub" style={{ margin: 0, fontSize: "13px" }}>
              Key indicators covering benchmark dataset availability, category taxonomies, and active session status.
            </div>
          </div>
          {hasAnalysis ? (
            <span className="badge badge-EXPAND">Analysis Active</span>
          ) : (
            <span className="badge" style={{ background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}>
              Ready For Analysis
            </span>
          )}
        </div>

        <div className="summary-grid">
          {/* Card 1: Benchmark Markets Available — real count from dataset-metadata */}
          <div className="summary-card">
            <div className="summary-card-header">
              <span className="summary-card-title">Benchmark State Markets</span>
              <div className="summary-card-icon">
                <BarChartIcon size={18} />
              </div>
            </div>
            <div className="summary-card-value">{statesCount} States</div>
            <div className="summary-card-subtext">
              <span>
                {datasetMeta
                  ? `${totalRecords} synthetic records · ${dataCompleteness}% complete`
                  : "All 36 Indian States & UTs covered"}
              </span>
            </div>
          </div>

          {/* Card 2: Product Categories — real count from dataset-metadata */}
          <div className="summary-card">
            <div className="summary-card-header">
              <span className="summary-card-title">Supported Categories</span>
              <div className="summary-card-icon" style={{ color: "var(--color-teal)" }}>
                <PackageIcon size={18} />
              </div>
            </div>
            <div className="summary-card-value">{categoriesCount} Domains</div>
            <div className="summary-card-subtext">
              <span>
                {datasetMeta?.available_categories?.slice(0, 2).join(", ")}
                {datasetMeta?.available_categories?.length > 2 ? ` +${datasetMeta.available_categories.length - 2} more` : ""}
              </span>
            </div>
          </div>

          {/* Card 3: Top Recommended Market / Active State */}
          <div className="summary-card">
            <div className="summary-card-header">
              <span className="summary-card-title">Top Recommended State</span>
              <div className="summary-card-icon" style={{ color: "var(--color-navy)" }}>
                <TargetIcon size={18} />
              </div>
            </div>
            {hasAnalysis && topMarket ? (
              <>
                <div className="summary-card-value" style={{ fontSize: "22px", color: "var(--color-navy)" }}>
                  {topMarket.state}
                </div>
                <div className="summary-card-subtext">
                  <span className={`badge badge-${topMarket.recommendation}`} style={{ fontSize: "10px", padding: "2px 8px" }}>
                    {topMarket.recommendation} ({topMarket.market_fit_score}/100)
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="summary-card-value" style={{ color: "var(--color-text-subtle)", fontSize: "20px" }}>
                  Awaiting Input
                </div>
                <div className="summary-card-subtext">
                  <span>Run analysis to identify best market</span>
                </div>
              </>
            )}
          </div>

          {/* Card 4: Analysis Activity Status */}
          <div className="summary-card">
            <div className="summary-card-header">
              <span className="summary-card-title">Session Activity</span>
              <div className="summary-card-icon" style={{ color: "var(--color-navy)" }}>
                <BuildingIcon size={18} />
              </div>
            </div>
            {hasAnalysis ? (
              <>
                <div className="summary-card-value" style={{ fontSize: "20px", color: "var(--color-navy)" }}>
                  {avgFitScore} <span style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>avg score</span>
                </div>
                <div className="summary-card-subtext">
                  <span style={{ color: "var(--color-teal)", fontWeight: 600 }}>
                    {analysis.categorization?.category || msme.product_name}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="summary-card-value" style={{ color: "var(--color-text-subtle)", fontSize: "20px" }}>
                  New Session
                </div>
                <div className="summary-card-subtext">
                  <span>No prior evaluations active</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Complete Workflow Visual (Step 1 requirement) */}
      <div className="card">
        <div className="card-header-clean">
          <div>
            <h2 className="card-title">End-to-End Decision Framework</h2>
            <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "2px" }}>
              How your business parameters flow into transparent market suitability and entry strategies.
            </div>
          </div>
          <button
            className="btn btn-secondary"
            style={{ fontSize: "13px", padding: "6px 14px" }}
            onClick={handleStartAnalysis}
          >
            <span>Start Analysis</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              padding: "18px 16px",
              background: "var(--color-surface-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--color-navy)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800 }}>
                1
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-navy)" }}>
                Business Profile
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>
              Enter product identity, unit price, production limits, expansion budget, target customer model, and operational constraints.
            </p>
          </div>

          <div
            style={{
              padding: "18px 16px",
              background: "var(--color-surface-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--color-teal)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800 }}>
                2
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-navy)" }}>
                Categorization &amp; Review
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>
              Detect product category &amp; subcategory. Review or customize the classification before running analytical scoring.
            </p>
          </div>

          <div
            style={{
              padding: "18px 16px",
              background: "var(--color-surface-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--color-navy)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800 }}>
                3
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-navy)" }}>
                Ranked Recommendations
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>
              View top 3 state markets with composite scores (0–100), Expand/Pilot/Avoid status, factor breakdown, and side-by-side comparisons.
            </p>
          </div>

          <div
            style={{
              padding: "18px 16px",
              background: "var(--color-surface-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--color-teal)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800 }}>
                4
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-navy)" }}>
                What-If &amp; Strategy
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>
              Simulate price &amp; freight shocks to see ranking shifts, and receive structured budget allocations and go-to-market roadmaps.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset & Methodology Transparency Notice (Requirement 7) */}
      <div className="disclaimer-banner">
        <InfoIcon size={18} style={{ color: "var(--color-teal)", flexShrink: 0 }} />
        <div>
          <strong>Data Transparency &amp; Prototype Notice:</strong>{" "}
          {datasetMeta
            ? `Market dataset: ${datasetMeta.dataset_name}. Covers ${datasetMeta.states_covered_count} States/UTs · ${datasetMeta.total_records} records · ${datasetMeta.completeness_percentage}% complete. `
            : "Market dataset values represent a 2024–25 synthetic benchmark calibrated against Indian state economic and logistics parameters. "}
          All scoring formulas are rule-based, deterministic, and transparent.{" "}
          <strong>Synthetic data only — not official Census, MOSPI, or RBI statistics.</strong>
        </div>
      </div>
    </div>
  );
}
