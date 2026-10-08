import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const INDIAN_STATES = [
  "Karnataka", "Telangana", "Maharashtra", "Tamil Nadu", "Gujarat",
  "Uttar Pradesh", "Delhi", "Kerala", "West Bengal", "Punjab",
  "Rajasthan", "Madhya Pradesh", "Haryana", "Andhra Pradesh", "Bihar",
];

const CONSTRAINT_OPTIONS = ["Budget", "Transportation", "Competition"];

export default function BusinessDetails() {
  const navigate = useNavigate();
  const { msme, setMsme } = useAppContext();

  const update = (field, value) => setMsme((prev) => ({ ...prev, [field]: value }));

  const toggleConstraint = (option) => {
    setMsme((prev) => {
      const has = prev.constraints.includes(option);
      return {
        ...prev,
        constraints: has
          ? prev.constraints.filter((c) => c !== option)
          : [...prev.constraints, option],
      };
    });
  };

  const isValid =
    msme.product_name && msme.current_state && msme.selling_price &&
    msme.production_capacity && msme.expansion_budget;

  const fillExample = () => {
    setMsme({
      product_name: "Millet Snacks",
      product_description: "Healthy packaged millet-based snacks",
      current_state: "Karnataka",
      selling_price: 120,
      production_capacity: 5000,
      expansion_budget: 200000,
      target_customer: "B2C",
      constraints: ["Budget", "Transportation", "Competition"],
    });
  };

  return (
    <div className="card">
      <div className="section-title">MSME Business Information</div>
      <div className="section-sub">
        Tell us about your product and business so we can evaluate suitable markets.{" "}
        <button
          onClick={fillExample}
          style={{ border: "none", background: "none", color: "var(--color-primary)", cursor: "pointer", fontWeight: 600 }}
        >
          Fill example data
        </button>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label>Product Name</label>
          <input value={msme.product_name} onChange={(e) => update("product_name", e.target.value)} placeholder="e.g. Millet Snacks" />
        </div>

        <div className="form-field">
          <label>Current Location / State</label>
          <select value={msme.current_state} onChange={(e) => update("current_state", e.target.value)}>
            <option value="">Select state</option>
            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="form-field" style={{ gridColumn: "1 / -1" }}>
          <label>Product Description</label>
          <textarea rows={2} value={msme.product_description} onChange={(e) => update("product_description", e.target.value)} placeholder="Briefly describe your product" />
        </div>

        <div className="form-field">
          <label>Selling Price (₹)</label>
          <input type="number" value={msme.selling_price} onChange={(e) => update("selling_price", e.target.value)} placeholder="e.g. 120" />
        </div>

        <div className="form-field">
          <label>Production Capacity (units/month)</label>
          <input type="number" value={msme.production_capacity} onChange={(e) => update("production_capacity", e.target.value)} placeholder="e.g. 5000" />
        </div>

        <div className="form-field">
          <label>Expansion Budget (₹)</label>
          <input type="number" value={msme.expansion_budget} onChange={(e) => update("expansion_budget", e.target.value)} placeholder="e.g. 200000" />
        </div>

        <div className="form-field">
          <label>Target Customer Type</label>
          <select value={msme.target_customer} onChange={(e) => update("target_customer", e.target.value)}>
            <option value="B2C">B2C (direct to consumer)</option>
            <option value="B2B">B2B (business to business)</option>
          </select>
        </div>

        <div className="form-field" style={{ gridColumn: "1 / -1" }}>
          <label>Expansion Constraints</label>
          <div className="checkbox-row">
            {CONSTRAINT_OPTIONS.map((opt) => (
              <label className="checkbox-item" key={opt}>
                <input
                  type="checkbox"
                  checked={msme.constraints.includes(opt)}
                  onChange={() => toggleConstraint(opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={() => navigate("/")}>← Back</button>
        <button
          className="btn btn-primary"
          disabled={!isValid}
          onClick={() => navigate("/categorization")}
        >
          Analyze Markets
        </button>
      </div>
    </div>
  );
}
