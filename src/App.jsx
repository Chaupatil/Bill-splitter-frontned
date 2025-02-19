import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Home } from "./pages/Home";
import { ExpenseManager } from "./pages/ExpenseManager";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/expenses" element={<ExpenseManager />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
};

export default App;
