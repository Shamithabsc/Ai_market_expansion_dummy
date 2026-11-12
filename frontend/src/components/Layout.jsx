import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import {
  DashboardIcon,
  AnalysisIcon,
  RecommendationsIcon,
  WhatIfIcon,
  StrategyIcon,
  SparklesIcon,
  MenuIcon,
  CloseIcon,
  RefreshIcon,
  BuildingIcon,
} from "./Icons";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: DashboardIcon },
  { path: "/business-details", label: "New Market Analysis", icon: AnalysisIcon },
  { path: "/recommendations", label: "Market Recommendations", icon: RecommendationsIcon },
  { path: "/what-if", label: "What-If Analysis", icon: WhatIfIcon },
  { path: "/strategy", label: "Market Entry Strategy", icon: StrategyIcon },
];

const WORKFLOW_STEPS = [
  { path: "/business-details", label: "1. Business Profile", num: 1 },
  { path: "/categorization", label: "2. Categorization", num: 2 },
  { path: "/recommendations", label: "3. Recommendations", num: 3 },
  { path: "/market-details", label: "4. Details & Comparison", num: 4 },
  { path: "/what-if", label: "5. What-If Simulation", num: 5 },
  { path: "/strategy", label: "6. Entry Strategy", num: 6 },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { msme, analysis, resetAll } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentWorkflowIndex = WORKFLOW_STEPS.findIndex((s) => s.path === location.pathname);

  const isNavActive = (path) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/business-details") {
      return location.pathname === "/business-details" || location.pathname === "/categorization";
    }
    if (path === "/recommendations") {
      return location.pathname === "/recommendations" || location.pathname === "/market-details";
    }
    return location.pathname === path;
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Executive Overview & Summary";
      case "/business-details":
        return "Step 1: MSME Business Profile";
      case "/categorization":
        return "Step 2: Product Categorization & Review";
      case "/recommendations":
        return "Step 3: Market Recommendations";
      case "/market-details":
        return "Step 4: Market Diagnostics & Comparison";
      case "/what-if":
        return "Step 5: What-If Scenario Simulation";
      case "/strategy":
        return "Step 6: Market Entry Strategy";
      default:
        return "Market Expansion Platform";
    }
  };

  const handleNavClick = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <div className="app-shell">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* Modern Sidebar */}
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={() => handleNavClick("/")}>
            <div className="brand-icon">
              <SparklesIcon size={20} />
            </div>
            <div>
              <div className="brand-text-title">AI Market Expansion</div>
              <div className="brand-text-sub">Advisor for MSMEs</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Navigation</div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.path);
            return (
              <div
                key={item.path}
                className={`nav-item ${active ? "active" : ""}`}
                onClick={() => handleNavClick(item.path)}
              >
                <div className="nav-item-icon">
                  <Icon size={18} />
                </div>
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer with Active Profile */}
        <div className="sidebar-footer">
          <div className="active-msme-pill">
            <div className="active-msme-label">
              <span>Active Business Profile</span>
              <span
                style={{
                  display: "inline-block",
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: analysis ? "var(--color-expand)" : msme.product_name ? "var(--color-pilot)" : "#94a3b8",
                }}
              />
            </div>
            <div className="active-msme-name">
              {msme.product_name ? msme.product_name : "No profile configured"}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                marginTop: "3px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{msme.current_state ? msme.current_state : "India"}</span>
              <span style={{ color: analysis ? "#2dd4bf" : "#cbd5e1" }}>
                {analysis ? "Analysis Active" : msme.product_name ? "Draft" : "Empty"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-left">
            <button
              className="mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
            </button>
            <div className="header-title-wrapper">
              <div className="header-title">{getPageTitle()}</div>
              <div className="header-sub">
                AI Market Expansion Advisor &bull; Indian State Expansion Platform
              </div>
            </div>
          </div>

          <div className="header-actions">
            {(analysis || msme.product_name) && (
              <button
                className="btn btn-secondary"
                style={{ padding: "6px 12px", fontSize: "12.5px" }}
                onClick={() => {
                  resetAll();
                  navigate("/business-details");
                }}
                title="Reset session and start new analysis"
              >
                <RefreshIcon size={14} />
                <span>New Analysis</span>
              </button>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--color-text-muted)",
                background: "var(--color-surface-subtle)",
                padding: "6px 12px",
                borderRadius: "20px",
                border: "1px solid var(--color-border)",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "var(--color-expand)",
                }}
              />
              <span>System Online</span>
            </div>
          </div>
        </header>

        <main className="page-container">
          {/* Workflow Stepper */}
          {currentWorkflowIndex !== -1 && (
            <div className="workflow-progress-bar">
              {WORKFLOW_STEPS.map((step, idx) => {
                const isActive = idx === currentWorkflowIndex;
                const isDone = idx < currentWorkflowIndex;
                return (
                  <div key={step.path} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      className={`workflow-step ${isActive ? "active" : isDone ? "done" : ""}`}
                      onClick={() => navigate(step.path)}
                      title={`Go to ${step.label}`}
                    >
                      <div className="step-circle">{step.num}</div>
                      <span>{step.label}</span>
                    </div>
                    {idx < WORKFLOW_STEPS.length - 1 && (
                      <span className="step-arrow-divider">›</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
