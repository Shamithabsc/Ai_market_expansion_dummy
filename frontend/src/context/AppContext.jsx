import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

const initialMSME = {
  product_name: "",
  product_description: "",
  current_state: "",
  selling_price: "",
  production_capacity: "",
  expansion_budget: "",
  target_customer: "B2C",
  constraints: [],
};

export function AppProvider({ children }) {
  const [msme, setMsme] = useState(initialMSME);
  const [analysis, setAnalysis] = useState(null); // { categorization, top_markets, all_markets, disclaimer }
  const [selectedState, setSelectedState] = useState(null);

  const resetAll = () => {
    setMsme(initialMSME);
    setAnalysis(null);
    setSelectedState(null);
  };

  return (
    <AppContext.Provider
      value={{ msme, setMsme, analysis, setAnalysis, selectedState, setSelectedState, resetAll }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
