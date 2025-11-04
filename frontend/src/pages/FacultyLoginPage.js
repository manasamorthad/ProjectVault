import React, { useState } from "react";
import axios from "axios";
import "./FacultyLoginPagecss.css";
import { useNavigate } from "react-router-dom";

function FacultyLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const navigate = useNavigate();
  // Use a fallback to an env var so local development can use HTTP
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_URL}/faculty/login`, { email, password });
      localStorage.setItem("facultyToken", res.data.token);
      navigate("/faculty-dashboard");
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_URL}/faculty/auth/forgot-password`, {
        email: forgotEmail,
      });
      setMessage(res.data.message || "Password reset email sent successfully!");
      setShowForgotPassword(false);
      setForgotEmail("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="faculty-login-container">
      <div className="faculty-login-header">
        <h1>ProjectVault</h1>
        <p>Faculty Administration Portal</p>
      </div>

      <div className="faculty-login-box">
        <h2>{showForgotPassword ? "Reset Password" : "Faculty Login"}</h2>

        {!showForgotPassword ? (
          <form onSubmit={handleLogin} className="faculty-login-form">
            <input
              type="email"
              placeholder="Faculty Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>
            <span
              className="faculty-forgot-link"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </span>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="faculty-forgot-form">
            <input
              type="email"
              placeholder="Enter your registered email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={isSending}>
              {isSending ? "Sending..." : "Send Reset Link"}
            </button>
            <span
              className="faculty-forgot-link"
              onClick={() => setShowForgotPassword(false)}
            >
              Back to Login
            </span>
          </form>
        )}

        {message && (
          <div
            className={`faculty-message ${
              message.toLowerCase().includes("success")
                ? "success"
                : "error"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default FacultyLoginPage;
