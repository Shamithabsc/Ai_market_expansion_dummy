import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import {
  PackageIcon,
  BuildingIcon,
  RupeeIcon,
  SlidersIcon,
  TargetIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
  InfoIcon,
} from "../components/Icons";

const INDIAN_STATES = [
  // South
  "Andhra Pradesh", "Karnataka", "Kerala", "Tamil Nadu", "Telangana",
  // West
  "Goa", "Gujarat", "Maharashtra", "Rajasthan",
  // North
  "Delhi", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Ladakh",
  "Punjab", "Uttarakhand", "Uttar Pradesh",
  // Central
  "Chhattisgarh", "Madhya Pradesh",
  // East
  "Bihar", "Jharkhand", "Odisha", "West Bengal",
  // North-East
  "Arunachal Pradesh", "Assam", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Sikkim", "Tripura",
  // Union Territories
  "Andaman & Nicobar Islands", "Chandigarh", "Dadra & Nagar Haveli and Daman & Diu",
  "Lakshadweep", "Puducherry",
];

const CATEGORY_OPTIONS = [
  "Food & Beverages",
  "Textiles & Apparel",
  "Handicrafts",
  "Electronics & Hardware",
  "Agriculture & Farm Products",
  "Personal Care & Cosmetics",
  "General Merchandise",
];

const CUSTOMER_BASE_OPTIONS = [
  "Local / Within District",
  "State-wide (Single State)",
  "Regional (2–3 Neighboring States)",
  "Pan-India Online / Direct",
];

const CONSTRAINT_OPTIONS = [
  {
    id: "Budget",
    title: "Capital / Budget Limit",
    desc: "Strict marketing or launch capital ceiling; penalizes high-cost entry states",
  },
  {
    id: "Transportation",
    title: "Logistics & Transport Sensitive",
    desc: "Perishable items or high freight; penalizes distant or lower-connectivity states",
  },
  {
    id: "Competition",
    title: "High Competition Risk",
    desc: "Averse to saturated markets; penalizes heavy incumbent presence",
  },
];

export default function BusinessDetails() {
  const navigate = useNavigate();
  const { msme, setMsme, loadSampleProfile } = useAppContext();
  const [touched, setTouched] = useState(false);

  const update = (field, value) => {
    setMsme((prev) => ({ ...prev, [field]: value }));
  };

  const toggleConstraint = (optionId) => {
    setMsme((prev) => {
      const exists = prev.constraints.includes(optionId);
      return {
        ...prev,
        constraints: exists
          ? prev.constraints.filter((c) => c !== optionId)
          : [...prev.constraints, optionId],
      };
    });
  };

  const isValid = Boolean(
    msme.product_name?.trim() &&
    msme.current_state &&
    Number(msme.selling_price) > 0 &&
    Number(msme.production_capacity) > 0 &&
    Number(msme.expansion_budget) > 0
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    navigate("/categorization");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          padding: "20px 24px",
        }}
      >
        <div>
          <h1 className="section-title" style={{ fontSize: "20px" }}>
            Step 1: MSME Business Profile &amp; Parameters
          </h1>
          <div className="section-sub" style={{ margin: 0 }}>
            Specify your product parameters and operational scale. All inputs are retained across the workflow.
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={loadSampleProfile}
          style={{ fontSize: "13px", padding: "8px 14px", display: "inline-flex", gap: "6px" }}
          title="Pre-populate with sample millet snack MSME data"
        >
          <SparklesIcon size={14} style={{ color: "var(--color-teal)" }} />
          <span>Load Sample MSME Data</span>
        </button>
      </div>

      {/* Section 1: Product Profile */}
      <div className="form-section">
        <div className="form-section-header">
          <div className="form-section-icon">
            <PackageIcon size={18} />
          </div>
          <div>
            <h2 className="form-section-title">1. Product Profile &amp; Category</h2>
            <div className="form-section-desc">
              Define the commercial identity, category, and specifications of your product.
            </div>
          </div>
        </div>

        <div className="form-grid">
          {/* Product Name */}
          <div className="form-field">
            <label className="form-label">
              <span>Business / Product Name <span className="required-mark">*</span></span>
              {touched && !msme.product_name?.trim() && (
                <span style={{ fontSize: "11px", color: "var(--color-avoid)" }}>Required</span>
              )}
            </label>
            <input
              className="form-input"
              value={msme.product_name}
              onChange={(e) => update("product_name", e.target.value)}
              placeholder="e.g. Millet Crunch Snacks"
              required
            />
            <div className="helper-text">Commercial brand or product name to be expanded.</div>
          </div>

          {/* Product Category Selection */}
          <div className="form-field">
            <label className="form-label">
              <span>Product Category</span>
              <span style={{ fontSize: "11px", color: "var(--color-teal)", fontWeight: 600 }}>Reviewed in Step 2</span>
            </label>
            <select
              className="form-select"
              value={msme.product_category || "Food & Beverages"}
              onChange={(e) => update("product_category", e.target.value)}
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="helper-text">Select category or allow keyword classifier to confirm in Step 2.</div>
          </div>

          {/* Product Description */}
          <div className="form-field full-width">
            <label className="form-label">
              <span>Product Description &amp; Characteristics</span>
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Used for subcategory detection</span>
            </label>
            <textarea
              className="form-textarea"
              rows={2}
              value={msme.product_description}
              onChange={(e) => update("product_description", e.target.value)}
              placeholder="e.g. Healthy packaged roasted organic millet chips with authentic regional spices and zero artificial preservatives"
            />
            <div className="helper-text">
              Key ingredients, materials, or target usage help the rule-based engine detect subcategories and consumer persona.
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Operational Location & Financial Scale */}
      <div className="form-section">
        <div className="form-section-header">
          <div className="form-section-icon" style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}>
            <RupeeIcon size={18} />
          </div>
          <div>
            <h2 className="form-section-title">2. Operational Location &amp; Financial Scale</h2>
            <div className="form-section-desc">
              Your home base, unit pricing, monthly production limits, and expansion budget.
            </div>
          </div>
        </div>

        <div className="form-grid">
          {/* Current Business Location */}
          <div className="form-field">
            <label className="form-label">
              <span>Current Business Location / Home State <span className="required-mark">*</span></span>
              {touched && !msme.current_state && (
                <span style={{ fontSize: "11px", color: "var(--color-avoid)" }}>Select state</span>
              )}
            </label>
            <select
              className="form-select"
              value={msme.current_state}
              onChange={(e) => update("current_state", e.target.value)}
              required
            >
              <option value="">Select current state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="helper-text">Base manufacturing or headquarters state for transit friction modeling.</div>
          </div>

          {/* Selling Price */}
          <div className="form-field">
            <label className="form-label">
              <span>Unit Selling Price (₹) <span className="required-mark">*</span></span>
              {touched && Number(msme.selling_price) <= 0 && (
                <span style={{ fontSize: "11px", color: "var(--color-avoid)" }}>Must be &gt; 0</span>
              )}
            </label>
            <input
              className="form-input"
              type="number"
              min="1"
              step="any"
              value={msme.selling_price}
              onChange={(e) => update("selling_price", e.target.value)}
              placeholder="e.g. 120"
              required
            />
            <div className="helper-text">Target retail or wholesale selling price per unit in Indian Rupees.</div>
          </div>

          {/* Monthly Production Capacity */}
          <div className="form-field">
            <label className="form-label">
              <span>Monthly Production Capacity (Units) <span className="required-mark">*</span></span>
              {touched && Number(msme.production_capacity) <= 0 && (
                <span style={{ fontSize: "11px", color: "var(--color-avoid)" }}>Must be &gt; 0</span>
              )}
            </label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={msme.production_capacity}
              onChange={(e) => update("production_capacity", e.target.value)}
              placeholder="e.g. 5000"
              required
            />
            <div className="helper-text">Maximum monthly volume available for home + expansion markets.</div>
          </div>

          {/* Expansion Budget */}
          <div className="form-field">
            <label className="form-label">
              <span>Expansion Budget (₹) <span className="required-mark">*</span></span>
              {touched && Number(msme.expansion_budget) <= 0 && (
                <span style={{ fontSize: "11px", color: "var(--color-avoid)" }}>Must be &gt; 0</span>
              )}
            </label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={msme.expansion_budget}
              onChange={(e) => update("expansion_budget", e.target.value)}
              placeholder="e.g. 200000"
              required
            />
            <div className="helper-text">Total capital earmarked for marketing, distributor schemes, and logistics buffer.</div>
          </div>
        </div>
      </div>

      {/* Section 3: Target Customer, Existing Base & Constraints */}
      <div className="form-section">
        <div className="form-section-header">
          <div className="form-section-icon" style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
            <TargetIcon size={18} />
          </div>
          <div>
            <h2 className="form-section-title">3. Target Customer &amp; Business Constraints</h2>
            <div className="form-section-desc">
              Specify your commercial channel focus, current footprint, and operational restrictions.
            </div>
          </div>
        </div>

        <div className="form-grid">
          {/* Target Customer Segment */}
          <div className="form-field full-width">
            <label className="form-label">Target Customer Channel Model</label>
            <div className="segmented-control">
              <div
                className={`segmented-option ${msme.target_customer === "B2C" ? "selected" : ""}`}
                onClick={() => update("target_customer", "B2C")}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "2px solid",
                    borderColor: msme.target_customer === "B2C" ? "var(--color-teal)" : "#cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {msme.target_customer === "B2C" && (
                    <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--color-teal)" }} />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>B2C — Direct to Consumer &amp; Retail</div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                    Kirana stores, supermarkets, direct consumer delivery, quick-commerce
                  </div>
                </div>
              </div>

              <div
                className={`segmented-option ${msme.target_customer === "B2B" ? "selected" : ""}`}
                onClick={() => update("target_customer", "B2B")}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "2px solid",
                    borderColor: msme.target_customer === "B2B" ? "var(--color-teal)" : "#cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {msme.target_customer === "B2B" && (
                    <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--color-teal)" }} />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>B2B — Wholesale &amp; Institutional</div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                    Stockists, distributors, institutional suppliers, bulk buyers
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Customer Base (Optional - explicitly required in Step 2 prompt) */}
          <div className="form-field">
            <label className="form-label">
              <span>Current Customer Reach <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>(Optional)</span></span>
            </label>
            <select
              className="form-select"
              value={msme.current_customer_base || "Local / Within District"}
              onChange={(e) => update("current_customer_base", e.target.value)}
            >
              {CUSTOMER_BASE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <div className="helper-text">Indicates existing geographic saturation before new state expansion.</div>
          </div>

          {/* Business Constraints */}
          <div className="form-field full-width">
            <label className="form-label">
              <span>Business Expansion Constraints</span>
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Select all that apply</span>
            </label>
            <div className="checkbox-card-grid">
              {CONSTRAINT_OPTIONS.map((opt) => {
                const isSelected = msme.constraints?.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    className={`checkbox-card ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleConstraint(opt.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ marginTop: "3px", accentColor: "var(--color-teal)" }}
                    />
                    <div>
                      <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--color-navy)" }}>
                        {opt.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                        {opt.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/")}
        >
          <ArrowLeftIcon size={16} />
          <span>Back to Dashboard</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {!isValid && (
            <span style={{ fontSize: "12.5px", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <InfoIcon size={14} />
              <span>Fill all fields marked with *</span>
            </span>
          )}

          <button
            type="submit"
            className="btn btn-teal"
            disabled={!isValid}
            style={{ padding: "10px 24px", fontSize: "14.5px" }}
          >
            <span>Proceed to Categorization</span>
            <ArrowRightIcon size={16} />
          </button>
        </div>
      </div>
    </form>
  );
}
