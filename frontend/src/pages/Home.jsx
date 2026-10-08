import { useNavigate } from "react-router-dom";

const HOW_IT_WORKS = [
  "Enter business details",
  "Analyze potential markets",
  "Compare market suitability",
  "Evaluate scenarios",
  "Get an initial market-entry strategy",
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="hero">
        <h1>AI Market Expansion Advisor for MSMEs</h1>
        <p>
          A simple prototype that helps small and medium businesses evaluate which Indian
          states are the best fit for expanding their product — using demand, growth,
          competition, purchasing power, logistics and accessibility.
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/business-details")}>
          Start Analysis →
        </button>
      </div>

      <div className="card">
        <div className="section-title">How It Works</div>
        <div className="how-it-works">
          {HOW_IT_WORKS.map((step, i) => (
            <div className="step-box" key={step}>
              <div className="step-num">{i + 1}</div>
              <div>{step}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="disclaimer-banner" style={{ marginTop: 24 }}>
        This is a college-project prototype. Market data shown throughout the app is sample
        data for demonstration only, and will be replaced with verified datasets and models.
      </div>
    </div>
  );
}
