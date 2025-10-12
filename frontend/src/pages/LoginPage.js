import React, { useState } from "react";
import axios from "axios";
import "./LoginPage.css";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
  const [roll, setRoll] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_URL}/login`, { roll, password });

      // Safely get response values
      const token = res.data?.token;
      const studentRollNo = res.data?.studentRollNo || roll;
      const isAccessGranted = res.data?.isAccessGranted ?? false;

      if (!token) {
        throw new Error("No token received from server");
      }

      // Store in localStorage
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

        {message && <div className="message error">{message}</div>}

        <div className="faculty-link-container">
          <Link to="/faculty-login">Login as Faculty &rarr;</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
