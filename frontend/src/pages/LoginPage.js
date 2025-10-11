import React, { useState } from "react";
import axios from "axios";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [roll, setRoll] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/login`, {
        roll,
        password
      });
      setMessage(res.data.message);
      
      // Store student roll number in localStorage
      localStorage.setItem("studentRollNo", roll);
      localStorage.setItem("token", res.data.token);
      
      navigate("/home");

    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
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
          <p>Welcome back! Please sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className={`form-group ${roll ? 'floating' : ''}`}>
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
          
          <div className={`form-group ${password ? 'floating' : ''}`}>
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
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? '' : 'Login'}
          </button>
        </form>
        
        {message && (
          <div className={`message ${message.includes('failed') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;