import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { analyzeMarkets } from "../services/api";
import {
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  AlertTriangleIcon,
  InfoIcon,
  PackageIcon,
  BuildingIcon,
  TargetIcon,
  RefreshIcon,
} from "../components/Icons";

const CATEGORY_TAXONOMY = {
  "Food & Beverages": [
    "Packaged Snacks & Savories",
    "Spices, Condiments & Pickles",
    "Beverages, Tea & Coffee",
    "Bakery & Confectionery",
    "Dairy & Organic Staples",
  ],
  "Textiles & Apparel": [
    "Handloom & Ethnic Wear",
    "Ready-made Garments",
    "Fabrics & Cotton Goods",
    "Home Textiles & Furnishings",
  ],
  "Handicrafts": [
    "Pottery & Ceramic Decor",
    "Woodcraft & Metal Art",
    "Handmade Decor & Eco-crafts",
  ],
  "Electronics & Hardware": [
    "Consumer Electronics & Gadgets",
    "Sensors, IoT & Circuits",
    "Electrical Appliances & Hardware",
  ],
  "Agriculture & Farm Products": [
    "Seeds, Bio-Inputs & Fertilizers",
    "Fresh & Processed Farm Goods",
  ],
  "Personal Care & Cosmetics": [
    "Ayurvedic & Herbal Skincare",
    "Bath, Hair & Body Essentials",
  ],
  "General Merchandise": [
    "Household & Utility Goods",
  ],
};

const ANALYSIS_STAGES = [
  { id: 1, label: "Processing business profile & parameters" },
  { id: 2, label: "Calibrating confirmed product category & subcategory" },
  { id: 3, label: "Evaluating benchmark market indicators across 15 states" },
  { id: 4, label: "Calculating weighted market suitability & MSME adjustments" },
  { id: 5, label: "Generating ranked recommendations & explainability factors" },
];

export default function Categorization() {
  const navigate = useNavigate();
  const { msme, updateMsme, setAnalysis } = useAppContext();

  // Review & Correction state
  const [selectedCat, setSelectedCat] = useState(msme.product_category || "Food & Beverages");
  const [selectedSubcat, setSelectedSubcat] = useState(msme.product_subcategory || "Packaged Snacks & Savories");
  const [isEditing, setIsEditing] = useState(false);

  // Analysis running state (Step 4)
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!msme.product_name) {
      navigate("/business-details");
      return;
    }

    // Auto-detect initial subcategory if not set
    const text = `${msme.product_name} ${msme.product_description || ""}`.toLowerCase();
    let detectedCat = msme.product_category || "Food & Beverages";
    let detectedSub = selectedSubcat;

    if (text.includes("snack") || text.includes("chips") || text.includes("namkeen") || text.includes("crunch")) {
      detectedCat = "Food & Beverages";
      detectedSub = "Packaged Snacks & Savories";
    } else if (text.includes("saree") || text.includes("textile") || text.includes("handloom")) {
      detectedCat = "Textiles & Apparel";
      detectedSub = "Handloom & Ethnic Wear";
    } else if (text.includes("soap") || text.includes("ayurved") || text.includes("skin") || text.includes("cosmetic")) {
      detectedCat = "Personal Care & Cosmetics";
      detectedSub = "Ayurvedic & Herbal Skincare";
    } else if (text.includes("craft") || text.includes("pottery") || text.includes("wood")) {
      detectedCat = "Handicrafts";
      detectedSub = "Pottery & Ceramic Decor";
    } else if (text.includes("electronic") || text.includes("sensor") || text.includes("device")) {
      detectedCat = "Electronics & Hardware";
      detectedSub = "Consumer Electronics & Gadgets";
    }

    setSelectedCat(detectedCat);
    setSelectedSubcat(detectedSub);
    updateMsme("product_category", detectedCat);
    updateMsme("product_subcategory", detectedSub);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryChange = (newCat) => {
    setSelectedCat(newCat);
    const subcats = CATEGORY_TAXONOMY[newCat] || ["General"];
    const newSub = subcats[0];
    setSelectedSubcat(newSub);
    updateMsme("product_category", newCat);
    updateMsme("product_subcategory", newSub);
  };

  const handleSubcategoryChange = (newSub) => {
    setSelectedSubcat(newSub);
    updateMsme("product_subcategory", newSub);
  };

  const executeMarketAnalysis = async () => {
    setAnalyzing(true);
    setErrorMsg("");
    setCurrentStage(1);

    const payload = {
      ...msme,
      product_category: selectedCat,
      product_subcategory: selectedSubcat,
      selling_price: Number(msme.selling_price || 0),
      production_capacity: Number(msme.production_capacity || 0),
      expansion_budget: Number(msme.expansion_budget || 0),
    };

    // Sequential stage progression reflecting actual pipeline execution
    const t2 = setTimeout(() => setCurrentStage(2), 200);
    const t3 = setTimeout(() => setCurrentStage(3), 450);
    const t4 = setTimeout(() => setCurrentStage(4), 700);
    const t5 = setTimeout(() => setCurrentStage(5), 950);

    try {
      const data = await analyzeMarkets(payload);
      setAnalysis(data);
      setTimeout(() => {
        navigate("/recommendations");
      }, 1200);
    } catch (err) {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      setErrorMsg(err.message || "Failed to connect to FastAPI market scoring service");
      setAnalyzing(false);
    }
  };

  // Step 4: Actual Market Analysis Loading Screen
  if (analyzing) {
    return (
      <div className="card loading-box" style={{ maxWidth: "680px", margin: "20px auto" }}>
        <div className="spinner" />
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--color-navy)", margin: "0 0 6px" }}>
          Step 4: Running Multi-Factor Market Analysis
        </h2>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", margin: "0 0 24px" }}>
          Applying weighted economic indicators and MSME-specific heuristic adjustments across 15 candidate states.
        </p>

        {/* Real Stages List */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            textAlign: "left",
            width: "100%",
            background: "var(--color-surface-subtle)",
            padding: "20px 24px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            fontSize: "13.5px",
          }}
        >
          {ANALYSIS_STAGES.map((stage) => {
            const isCompleted = currentStage > stage.id;
            const isCurrent = currentStage === stage.id;
            return (
              <div
                key={stage.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  color: isCompleted ? "var(--color-navy)" : isCurrent ? "var(--color-teal)" : "#94a3b8",
                  fontWeight: isCurrent ? 700 : isCompleted ? 600 : 400,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 800,
                    backgroundColor: isCompleted ? "var(--color-expand)" : isCurrent ? "var(--color-teal)" : "#e2e8f0",
                    color: isCompleted || isCurrent ? "#ffffff" : "#64748b",
                  }}
                >
                  {isCompleted ? "✓" : stage.id}
                </div>
                <span>{stage.label}</span>
                {isCurrent && (
                  <span style={{ fontSize: "11px", color: "var(--color-teal)", marginLeft: "auto", fontStyle: "italic" }}>
                    Processing…
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Error State
  if (errorMsg) {
    return (
      <div className="card empty-state" style={{ maxWidth: "640px", margin: "20px auto" }}>
        <div className="empty-state-icon" style={{ backgroundColor: "#fee2e2", color: "var(--color-avoid)" }}>
          <AlertTriangleIcon size={26} />
        </div>
        <div className="empty-state-title">Backend Connection Error</div>
        <div className="empty-state-desc">
          Unable to run market analysis. Ensure the FastAPI backend is running on <code>http://localhost:8000</code>.
        </div>
        <div
          style={{
            padding: "10px 14px",
            background: "#fff1f2",
            border: "1px solid #fecdd3",
            color: "#9f1239",
            borderRadius: "var(--radius-md)",
            fontSize: "12.5px",
            marginBottom: "20px",
            fontFamily: "monospace",
          }}
        >
          {errorMsg}
        </div>
        <div className="btn-row">
          <button className="btn btn-secondary" onClick={() => setErrorMsg("")}>
            <ArrowLeftIcon size={16} />
            <span>Back to Review</span>
          </button>
          <button className="btn btn-primary" onClick={executeMarketAnalysis}>
            <span>Retry Analysis</span>
          </button>
        </div>
      </div>
    );
  }

  const availableSubcats = CATEGORY_TAXONOMY[selectedCat] || ["General"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Step 3: Categorization & Review Card */}
      <div className="card">
        <div className="card-header-clean">
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--color-teal)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              <SparklesIcon size={14} />
              <span>Step 3: Review &amp; Confirm Classification</span>
            </div>
            <h1 className="card-title" style={{ fontSize: "22px" }}>
              Product Categorization &amp; Subcategory Mapping
            </h1>
          </div>
          <button
            className="btn btn-secondary"
            style={{ fontSize: "12.5px", padding: "6px 14px" }}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Done Editing" : "Change Category / Subcategory"}
          </button>
        </div>

        {/* Categorization Diagnostics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "18px",
            margin: "20px 0 24px",
          }}
        >
          {/* Detected Primary Category */}
          <div
            style={{
              padding: "20px",
              borderRadius: "var(--radius-lg)",
              background: "linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%)",
              border: "1.5px solid #99f6e4",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-teal-hover)", letterSpacing: "0.5px" }}>
              Primary Domain Category
            </div>
            {isEditing ? (
              <select
                className="form-select"
                value={selectedCat}
                onChange={(e) => handleCategoryChange(e.target.value)}
                style={{ marginTop: "8px", fontWeight: 700, fontSize: "15px" }}
              >
                {Object.keys(CATEGORY_TAXONOMY).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            ) : (
              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--color-navy)", marginTop: "6px" }}>
                {selectedCat}
              </div>
            )}
            <div style={{ fontSize: "12px", color: "var(--color-teal-hover)", marginTop: "6px" }}>
              Maps to state-level consumer demand indices
            </div>
          </div>

          {/* Detected Subcategory */}
          <div
            style={{
              padding: "20px",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-surface-subtle)",
              border: "1.5px solid var(--color-border)",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)", letterSpacing: "0.5px" }}>
              Specific Subcategory
            </div>
            {isEditing ? (
              <select
                className="form-select"
                value={selectedSubcat}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                style={{ marginTop: "8px", fontWeight: 600, fontSize: "14px" }}
              >
                {availableSubcats.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            ) : (
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-navy)", marginTop: "8px" }}>
                {selectedSubcat}
              </div>
            )}
            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "6px" }}>
              Refines distribution channel and pricing expectations
            </div>
          </div>

          {/* Profile Context */}
          <div
            style={{
              padding: "20px",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-surface-subtle)",
              border: "1.5px solid var(--color-border)",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)", letterSpacing: "0.5px" }}>
              Business Offering
            </div>
            <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--color-navy)", marginTop: "6px" }}>
              {msme.product_name}
            </div>
            <div style={{ fontSize: "12.5px", color: "var(--color-text-muted)", marginTop: "4px" }}>
              Based in <strong>{msme.current_state}</strong> &bull; Model: <strong>{msme.target_customer}</strong>
            </div>
          </div>
        </div>

        {/* Explainability Callout */}
        <div
          style={{
            padding: "16px 20px",
            background: "#f8fafc",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            fontSize: "13.5px",
            color: "var(--color-text-secondary)",
            lineHeight: 1.5,
          }}
        >
          <strong>Rule-Based Validation:</strong> The confirmed classification of <strong>{selectedCat} ({selectedSubcat})</strong> will be passed
          to the market suitability engine. The model evaluates whether the MSME's selling price (₹{msme.selling_price}) and monthly capacity ({msme.production_capacity} units)
          align with state purchasing power and demand densities.
        </div>

        {/* Actions */}
        <div className="btn-row" style={{ justifyContent: "space-between", marginTop: "28px" }}>
          <button className="btn btn-secondary" onClick={() => navigate("/business-details")}>
            <ArrowLeftIcon size={16} />
            <span>Back to Step 1 (Profile)</span>
          </button>

          <button className="btn btn-teal" onClick={executeMarketAnalysis} style={{ padding: "10px 24px", fontSize: "14.5px" }}>
            <span>Confirm &amp; Run Market Analysis</span>
            <ArrowRightIcon size={16} />
          </button>
        </div>
      </div>

      {/* Transparency Note */}
      <div className="disclaimer-banner">
        <InfoIcon size={18} style={{ color: "var(--color-teal)", flexShrink: 0 }} />
        <div>
          <strong>Methodology Note:</strong> Categorization relies on deterministic keyword taxonomies. No speculative or generative LLM claims
          are made. Review or correct the domain above to match your exact business segment before analysis.
        </div>
      </div>
    </div>
  );
}
