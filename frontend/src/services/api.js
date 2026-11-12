// Central place for all backend calls.
// Connects to FastAPI backend at localhost:8000
const API_BASE = "http://localhost:8000";

async function handle(response) {
  if (!response.ok) {
    const text = await response.text();
    let msg = text;
    try {
      const parsed = JSON.parse(text);
      if (parsed.detail) msg = typeof parsed.detail === "string" ? parsed.detail : JSON.stringify(parsed.detail);
    } catch {
      // Keep raw text
    }
    throw new Error(`API error ${response.status}: ${msg}`);
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
    selling_price: msme.selling_price || 0,
    production_capacity: msme.production_capacity || 0,
    expansion_budget: msme.expansion_budget || 0,
    target_customer: msme.target_customer || "B2C",
    current_customer_base: msme.current_customer_base || "Local",
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

export async function getRawMarkets() {
  const res = await fetch(`${API_BASE}/markets`);
  return handle(res);
}

export async function getDatasetMetadata() {
  const res = await fetch(`${API_BASE}/dataset-metadata`);
  return handle(res);
}
