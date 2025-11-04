import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./ResetPassword.css"; // You can reuse the same CSS

function FacultyResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  // Use env var fallback so frontend and other pages share same API base
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // ✅ Step 1: Verify token presence
  useEffect(() => {
    if (!token) {
      setMessage("Invalid or missing reset token");
    } else {
      setIsValidToken(true);
    }
  }, [token]);

  // ✅ Step 2: Password validation
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("At least 8 characters long");
    if (!/(?=.*[A-Z])/.test(password)) errors.push("At least one uppercase letter");
    if (!/(?=.*[a-z])/.test(password)) errors.push("At least one lowercase letter");
    if (!/(?=.*\d)/.test(password)) errors.push("At least one number");
    if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':\"\\|,.<>/?])/.test(password))
      errors.push("At least one special character");
    return errors;
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setNewPassword(pwd);
    setPasswordErrors(pwd ? validatePassword(pwd) : []);
  };

  // ✅ Step 3: Handle password reset request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    const errors = validatePassword(newPassword);
    if (errors.length > 0) {
      setMessage("Please fix the password requirements below");
      setPasswordErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      // Debug: log token presence and masked password length
      console.log("Reset request -> token present:", !!token, "newPassword length:", newPassword.length);
      // Correct endpoint for faculty password reset
      const res = await axios.post(`${API_URL}/faculty/auth/reset-password`, {
        token,
        newPassword,
      });
      console.log("hello",token);
      setMessage("Password reset successfully! Redirecting to faculty login...");

      // Redirect to faculty login after short delay
      setTimeout(() => navigate("/faculty-login"), 2000);
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          err.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Password field toggles
  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const isPasswordValid = passwordErrors.length === 0 && newPassword.length > 0;

  if (!isValidToken) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-box">
          <div className="reset-password-header">
            <h2>Invalid Reset Link</h2>
            <p>{message || "The reset link is invalid or has expired."}</p>
            <button onClick={() => navigate("/faculty-login")} className="back-to-login-button">
              Back to Faculty Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        <div className="reset-password-header">
          <h2>Faculty Password Reset</h2>
          <p>Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          {/* New Password Field */}
          <div className={`form-group ${newPassword ? "floating" : ""}`}>
            <input
              type={showNewPassword ? "text" : "password"}
              className="form-input"
              placeholder="Enter new password"
              value={newPassword}
              onChange={handlePasswordChange}
              required
              minLength="8"
            />
            <label className="form-label">New Password</label>
            <button type="button" className="password-toggle" onClick={toggleNewPasswordVisibility}>
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className={`form-group ${confirmPassword ? "floating" : ""}`}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="form-input"
              placeholder="Enter confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="8"
            />
            <label className="form-label">Confirm Password</label>
            <button
              type="button"
              className="password-toggle"
              onClick={toggleConfirmPasswordVisibility}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {confirmPassword && (
            <div
              className={`password-match ${
                newPassword === confirmPassword ? "valid" : "invalid"
              }`}
            >
              {newPassword === confirmPassword
                ? "✓ Passwords match"
                : "✗ Passwords do not match"}
            </div>
          )}

          <button
            type="submit"
            className={`reset-button ${isLoading ? "loading" : ""} ${
              !isPasswordValid || newPassword !== confirmPassword ? "disabled" : ""
            }`}
            disabled={isLoading || !isPasswordValid || newPassword !== confirmPassword}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message && (
          <div
            className={`message ${
              message.includes("successfully") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default FacultyResetPassword;
