// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import { Toaster } from "@/components/ui/toaster";
// import { Home } from "./pages/Home";
// import { GroupExpenses } from "./pages/GroupExpenses";
// import Register from "./pages/Register";
// import Navbar from "./components/Navbar";
// import Login from "./pages/Login";
// import { ThemeProvider } from "./context/ThemeProvider";
// import PersonalExpenses from "./pages/PersonalExpenses"; // Import the personal expenses page
// import Profile from "./pages/Profile";

// // Protected Route Component
// const ProtectedRoute = ({ children }) => {
//   const user = localStorage.getItem("user");

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// const App = () => {
//   return (
//     <ThemeProvider>
//       <Router>
//         <div className="min-h-screen bg-background">
//           <Navbar />
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
//             <Route
//               path="/profile"
//               element={
//                 <ProtectedRoute>
//                   <Profile />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/expenses"
//               element={
//                 <ProtectedRoute>
//                   <GroupExpenses />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/personal-expenses"
//               element={
//                 <ProtectedRoute>
//                   <PersonalExpenses />
//                 </ProtectedRoute>
//               }
//             />
//           </Routes>
//           <Toaster />
//         </div>
//       </Router>
//     </ThemeProvider>
//   );
// };

// export default App;

import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Home } from "./pages/Home";
import { GroupExpenses } from "./pages/GroupExpenses";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import { ThemeProvider } from "./context/ThemeProvider";
import PersonalExpenses from "./pages/PersonalExpenses";
import Profile from "./pages/Profile";
import TokenExpiredModal from "./components/TokenExpiredModal";
import { setOnTokenExpired } from "./services/fetchWithAuth";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Inner app that can use navigate()
const AppContent = () => {
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setOnTokenExpired(() => setIsTokenExpired(true));
  }, []);

  const handleLoginRedirect = () => {
    setIsTokenExpired(false);
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <GroupExpenses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/personal-expenses"
          element={
            <ProtectedRoute>
              <PersonalExpenses />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />

      {/* Token Expired Modal */}
      <TokenExpiredModal
        isOpen={isTokenExpired}
        onClose={() => setIsTokenExpired(false)}
        onLogin={handleLoginRedirect}
      />
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
};

export default App;
