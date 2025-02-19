// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { Toaster } from "@/components/ui/toaster";
// import { Home } from "./pages/Home";
// import { ExpenseManager } from "./pages/ExpenseManager";

// const App = () => {
//   return (
//     <Router>
//       <div className="min-h-screen bg-background">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/expenses" element={<ExpenseManager />} />
//         </Routes>
//         <Toaster />
//       </div>
//     </Router>
//   );
// };

// export default App;

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Home } from "./pages/Home";
import { ExpenseManager } from "./pages/ExpenseManager";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <ExpenseManager />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
};

export default App;
