// Central place for all backend calls.
// Change API_BASE if the FastAPI server runs on a different host/port.
const API_BASE = "http://localhost:8000";

async function handle(response) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }
  return response.json();
}

export async function analyzeMarkets(msme) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ msme }),
  });
  return handle(res);
}

export async function getMarketDetail(state, msme) {
  const params = new URLSearchParams({
    selling_price: msme.selling_price,
    production_capacity: msme.production_capacity,
    expansion_budget: msme.expansion_budget,
    target_customer: msme.target_customer,
    constraints: (msme.constraints || []).join(","),
  });
  const res = await fetch(`${API_BASE}/market/${encodeURIComponent(state)}?${params.toString()}`);
  return handle(res);
}

export async function runWhatIf({ state, msme, demandChangePct, transportCostChangePct }) {
  const res = await fetch(`${API_BASE}/what-if`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      state,
      msme,
      demand_change_pct: demandChangePct,
      transport_cost_change_pct: transportCostChangePct,
    }),
  });
  return handle(res);
}

export async function getStrategy(state, msme) {
  const res = await fetch(`${API_BASE}/strategy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state, msme }),
  });
  return handle(res);
}
