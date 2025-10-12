import React, { useState } from "react";
import axios from "axios";
import "./LoginPage.css"; // Reuse login styles
import { useNavigate } from "react-router-dom";

function FacultyLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/faculty/login`, {
        email,
        password
      });
      localStorage.setItem("facultyToken", res.data.token);
      navigate("/faculty-dashboard");
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
            <p>Faculty Administration</p>
        </div>
      <div className="login-box">
        <div className="login-header">
          <h2>Faculty Login</h2>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className={`form-group ${email ? 'floating' : ''}`}>
            <input type="email" className="form-input" placeholder="" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <label className="form-label">Email</label>
          </div>
          <div className={`form-group ${password ? 'floating' : ''}`}>
            <input type="password" className="form-input" placeholder="" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <label className="form-label">Password</label>
          </div>
          <button type="submit" className={`login-button ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
            {isLoading ? '' : 'Login to Dashboard'}
          </button>
        </form>
        {message && <div className="message error">{message}</div>}
      </div>
    </div>
  );
}

export default FacultyLoginPage;

