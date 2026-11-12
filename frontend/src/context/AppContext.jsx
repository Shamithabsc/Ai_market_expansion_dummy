import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export const SAMPLE_MSME = {
  product_name: "Millet Crunch Snacks",
  product_description: "Healthy packaged roasted organic millet chips with authentic regional spices and zero artificial preservatives",
  product_category: "Food & Beverages",
  product_subcategory: "Packaged Snacks & Savories",
  current_state: "Karnataka",
  selling_price: 120,
  production_capacity: 5000,
  expansion_budget: 200000,
  target_customer: "B2C",
  current_customer_base: "Local / Within District",
  constraints: ["Budget", "Transportation"],
};

const initialMSME = {
  product_name: "",
  product_description: "",
  product_category: "Food & Beverages",
  product_subcategory: "Packaged Snacks & Savories",
  current_state: "",
  selling_price: "",
  production_capacity: "",
  expansion_budget: "",
  target_customer: "B2C",
  current_customer_base: "Local / Within District",
  constraints: [],
};

export function AppProvider({ children }) {
  const [msme, setMsme] = useState(initialMSME);
  const [categorization, setCategorization] = useState(null);
  const [analysis, setAnalysisState] = useState(null); // { categorization, top_markets, all_markets, comparative_summary, disclaimer }
  const [selectedState, setSelectedState] = useState(null);

  const updateMsme = (field, value) => {
    setMsme((prev) => ({ ...prev, [field]: value }));
  };

  const setAnalysis = (data) => {
    setAnalysisState(data);
    if (data?.categorization) {
      setCategorization(data.categorization);
    }
    if (data?.top_markets?.length > 0 && !selectedState) {
      setSelectedState(data.top_markets[0].state);
    }
  };

  const loadSampleProfile = () => {
    setMsme(SAMPLE_MSME);
  };

  const resetAll = () => {
    setMsme(initialMSME);
    setCategorization(null);
    setAnalysisState(null);
    setSelectedState(null);
  };

  return (
    <AppContext.Provider
      value={{
        msme,
        setMsme,
        updateMsme,
        categorization,
        setCategorization,
        analysis,
        setAnalysis,
        selectedState,
        setSelectedState,
        resetAll,
        loadSampleProfile,
      }}
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
