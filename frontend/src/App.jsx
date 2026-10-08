import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import BusinessDetails from "./pages/BusinessDetails";
import Categorization from "./pages/Categorization";
import Recommendations from "./pages/Recommendations";
import MarketDetails from "./pages/MarketDetails";
import WhatIf from "./pages/WhatIf";
import Strategy from "./pages/Strategy";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/business-details" element={<BusinessDetails />} />
            <Route path="/categorization" element={<Categorization />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/market-details" element={<MarketDetails />} />
            <Route path="/what-if" element={<WhatIf />} />
            <Route path="/strategy" element={<Strategy />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
