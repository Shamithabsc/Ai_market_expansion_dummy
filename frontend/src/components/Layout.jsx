import { useLocation, useNavigate } from "react-router-dom";

const STEPS = [
  { path: "/business-details", label: "Business Details" },
  { path: "/categorization", label: "Analysis" },
  { path: "/recommendations", label: "Recommendations" },
  { path: "/market-details", label: "Market Details" },
  { path: "/what-if", label: "What-If" },
  { path: "/strategy", label: "Strategy" },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentIndex = STEPS.findIndex((s) => s.path === location.pathname);

  return (
    <div className="app-shell">
      <div className="top-header">
        <div className="brand" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          🌱 AI Market Expansion Advisor
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          MSME Prototype — Academic Demo
        </div>
      </div>

      {currentIndex !== -1 && (
        <nav className="progress-nav">
          {STEPS.map((step, i) => (
            <span key={step.path} style={{ display: "flex", alignItems: "center" }}>
              <span
                className={`progress-step ${i === currentIndex ? "active" : i < currentIndex ? "done" : ""}`}
              >
                {i + 1}. {step.label}
              </span>
              {i < STEPS.length - 1 && <span className="progress-arrow">›</span>}
            </span>
          ))}
        </nav>
      )}

      <div className="page-container">{children}</div>
    </div>
  );
}
