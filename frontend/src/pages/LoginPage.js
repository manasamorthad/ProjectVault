import React, { useState } from "react";
import axios from "axios";
import "./LoginPage.css";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
  const [roll, setRoll] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordRoll, setForgotPasswordRoll] = useState("");
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_URL}/login`, { roll, password });

      const token = res.data?.token;
      const studentRollNo = res.data?.studentRollNo || roll;
      const isAccessGranted = res.data?.isAccessGranted ?? false;

      if (!token) {
        throw new Error("No token received from server");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("studentRollNo", studentRollNo);
      localStorage.setItem("isAccessGranted", isAccessGranted);

      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);
      setMessage(
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
  e.preventDefault();
  setForgotPasswordLoading(true);
  setMessage("");

  try {
    const res = await axios.post(`${API_URL}/forgot-password`, { 
      roll: forgotPasswordRoll 
    });

    setMessage(res.data.message || "Password reset email sent successfully!");
    setShowForgotPassword(false);
    setForgotPasswordRoll("");
  } catch (err) {
    const errorMessage = err.response?.data?.message || 
                        err.message || 
                        "Failed to send reset email. Please try again.";
    setMessage(errorMessage);
    
    // Keep the form open if it's a user error
    if (err.response?.status !== 404 && err.response?.status !== 400) {
      setShowForgotPassword(false);
    }
  } finally {
    setForgotPasswordLoading(false);
  }
};


  return (
    <div className="login-container">
      <div className="login-title">
        <h1>ProjectVault</h1>
        <p>Students Project Repository</p>
      </div>

      <div className="login-box">
        <div className="login-header">
          <h2>Student Login</h2>
        </div>

        {!showForgotPassword ? (
          <>
            <form onSubmit={handleSubmit} className="login-form">
              <div className={`form-group ${roll ? "floating" : ""}`}>
                <input
                  type="text"
                  className="form-input"
                  placeholder=""
                  value={roll}
                  onChange={(e) => setRoll(e.target.value)}
                  required
                />
                <label className="form-label">Roll Number</label>
              </div>

              <div className={`form-group ${password ? "floating" : ""}`}>
                <input
                  type="password"
                  className="form-input"
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label className="form-label">Password</label>
              </div>

              <button
                type="submit"
                className={`login-button ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div 
              className="forgot-password-link"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </div>
          </>
        ) : (
          <form onSubmit={handleForgotPassword} className="login-form">
            <div className="forgot-password-header">
              <h3>Reset Password</h3>
              <p>Enter your roll number to receive a reset link</p>
            </div>

            <div className={`form-group ${forgotPasswordRoll ? "floating" : ""}`}>
              <input
                type="text"
                className="form-input"
                placeholder=""
                value={forgotPasswordRoll}
                onChange={(e) => setForgotPasswordRoll(e.target.value)}
                required
              />
              <label className="form-label">Roll Number</label>
            </div>

            <div className="forgot-password-buttons">
              <button
                type="submit"
                className={`login-button ${forgotPasswordLoading ? "loading" : ""}`}
                disabled={forgotPasswordLoading}
              >
                {forgotPasswordLoading ? "Sending..." : "Send Reset Link"}
              </button>
              
              <button
                type="button"
                className="back-to-login-button"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {message && (
          <div className={`message ${message.includes("successfully") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <div className="faculty-link-container">
          <Link to="/faculty-login">Login as Faculty &rarr;</Link>
        </div>
        <div className="faculty-link-container">
          <Link to="/admin-login">Login as Admin &rarr;</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;