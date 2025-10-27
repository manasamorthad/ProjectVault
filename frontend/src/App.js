import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import FacultyLoginPage from "./pages/FacultyLoginPage";
import FacultyDashboard from "./pages/FacultyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLoginPage from "./pages/AdminLoginPage";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/faculty-login" element={<FacultyLoginPage />} />
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
         <Route path="/reset-password" element={<ResetPassword />} /> 
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;


