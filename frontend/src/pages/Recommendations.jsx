import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function Recommendations() {
  const navigate = useNavigate();
  const { analysis, setSelectedState, resetAll } = useAppContext();

  if (!analysis) {
    return (
      <div className="card empty-state">
        No analysis found yet.
        <div className="btn-row" style={{ justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={() => navigate("/business-details")}>Start Analysis</button>
        </div>
      </div>
    );
  }

  const goToDetails = (state) => {
    setSelectedState(state);
    navigate("/market-details");
  };

  const goToWhatIf = (state) => {
    setSelectedState(state);
    navigate("/what-if");
  };

  return (
    <div>
      <div className="disclaimer-banner">{analysis.disclaimer}</div>

      <div className="card">
        <div className="section-title">Top 3 Market Recommendations</div>
        <div className="section-sub">
          Ranked by Market Fit Score, based on demand, growth, competition, purchasing power,
          logistics and accessibility — adjusted for your business inputs.
        </div>

        <div className="market-grid">
          {analysis.top_markets.map((m, i) => (
            <div className="card market-card" key={m.state}>
              <div className="rank-pill">{i + 1}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{m.state}</div>
                  <span className={`badge badge-${m.recommendation}`}>{m.recommendation}</span>
                </div>
                <div className="score-big">{m.market_fit_score}</div>
              </div>

              <div>
                <div className="factor-row"><span>Demand</span><span>{m.demand}</span></div>
                <div className="factor-row"><span>Market Growth</span><span>{m.market_growth}</span></div>
                <div className="factor-row"><span>Competition</span><span>{m.competition}</span></div>
                <div className="factor-row"><span>Purchasing Power</span><span>{m.purchasing_power}</span></div>
                <div className="factor-row"><span>Logistics</span><span>{m.logistics}</span></div>
                <div className="factor-row"><span>Accessibility</span><span>{m.accessibility}</span></div>
              </div>

              <div className="btn-row" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" onClick={() => goToDetails(m.state)}>View Details</button>
                <button className="btn btn-secondary" onClick={() => goToWhatIf(m.state)}>What-If Analysis</button>
              </div>
            </div>
          ))}
        </div>

        <div className="btn-row">
          <button className="btn btn-secondary" onClick={() => navigate("/business-details")}>Edit Inputs</button>
          <button
            className="btn btn-secondary"
            onClick={() => { resetAll(); navigate("/"); }}
          >
            Start New Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
