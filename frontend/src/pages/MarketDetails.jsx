import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAppContext } from "../context/AppContext";
import { getMarketDetail } from "../services/api";

export default function MarketDetails() {
  const navigate = useNavigate();
  const { selectedState, msme, analysis } = useAppContext();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedState) {
      navigate("/recommendations");
      return;
    }
    setLoading(true);
    getMarketDetail(selectedState, {
      ...msme,
      selling_price: Number(msme.selling_price),
      production_capacity: Number(msme.production_capacity),
      expansion_budget: Number(msme.expansion_budget),
    })
      .then((data) => setDetail(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState]);

  if (loading) return <div className="card loading-box"><div className="spinner" />Loading market details…</div>;
  if (error) return <div className="card empty-state">{error}</div>;
  if (!detail) return null;

  const m = detail.market;
  const chartData = [
    { factor: "Demand", value: m.demand },
    { factor: "Growth", value: m.market_growth },
    { factor: "Competition", value: m.competition },
    { factor: "Purch. Power", value: m.purchasing_power },
    { factor: "Logistics", value: m.logistics },
    { factor: "Accessibility", value: m.accessibility },
  ];

  return (
    <div>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="section-title">{m.state}</div>
            <span className={`badge badge-${m.recommendation}`}>{m.recommendation}</span>
          </div>
          <div className="score-big">{m.market_fit_score}</div>
        </div>

        <div className="two-col" style={{ marginTop: 24 }}>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="factor" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" fill="#1f6f54" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Why this score?</div>
            <p style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.6 }}>{detail.explanation}</p>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>Positive Factors</div>
              <div className="tag-list">
                {detail.positive_factors.map((f) => <span className="tag" key={f}>{f}</span>)}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>Risks</div>
              <div className="tag-list">
                {detail.risks.map((f) => <span className="tag risk" key={f}>{f}</span>)}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 6 }}>Limitations</div>
          <ul style={{ fontSize: 13.5, color: "var(--color-text-muted)", margin: 0, paddingLeft: 20 }}>
            {detail.limitations.map((l) => <li key={l}>{l}</li>)}
          </ul>
        </div>

        <div className="btn-row">
          <button className="btn btn-secondary" onClick={() => navigate("/recommendations")}>← Back to Recommendations</button>
          <button className="btn btn-primary" onClick={() => navigate("/what-if")}>What-If Analysis</button>
          <button className="btn btn-secondary" onClick={() => navigate("/strategy")}>Market Entry Strategy →</button>
        </div>
      </div>
    </div>
  );
}
