import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import FacultyLoginPage from "./pages/FacultyLoginPage";
import FacultyDashboard from "./pages/FacultyDashboard";
<<<<<<< Updated upstream
import AdminDashboard from "./pages/AdminDashboard";
import AdminLoginPage from "./pages/AdminLoginPage";
import ResetPassword from "./pages/ResetPassword";
import FacultyResetPassword from "./pages/FacultyResetPassword";
=======
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";

// A protected route component to guard the admin dashboard
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  // If no token, redirect to the admin login page
  return token ? children : <Navigate to="/admin-login" />;
};

>>>>>>> Stashed changes

function App() {
  return (
    <Router>
      <Routes>
        {/* Student Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<Home />} />
        
        {/* Faculty Routes */}
        <Route path="/faculty-login" element={<FacultyLoginPage />} />
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
<<<<<<< Updated upstream
        <Route path="/admin-login" element={<AdminLoginPage />} />
         <Route path="/reset-password" element={<ResetPassword />} /> 
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
<Route path="/faculty/reset-password" element={<FacultyResetPassword />} />

=======

        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route 
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
>>>>>>> Stashed changes
      </Routes>
    </Router>
  );
}

export default App;


