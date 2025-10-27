import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./ResetPassword.css";

function ResetPassword() {
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
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    // Check if token exists in URL
    if (!token) {
      setMessage("Invalid or missing reset token");
    } else {
      setIsValidToken(true);
    }
  }, [token]);

  // Function to validate password requirements
  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push("At least 8 characters long");
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("At least one uppercase letter");
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("At least one lowercase letter");
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push("At least one number");
    }

    if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) {
      errors.push("At least one special character");
    }

    return errors;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    
    // Validate password in real-time
    if (password.length > 0) {
      const errors = validatePassword(password);
      setPasswordErrors(errors);
    } else {
      setPasswordErrors([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    // Validate password requirements
    const errors = validatePassword(newPassword);
    if (errors.length > 0) {
      setMessage("Please fix the password requirements below");
      setPasswordErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/reset-password`, {
        token,
        newPassword
      });

      setMessage("Password reset successfully! Redirecting to login...");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);

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

  // Toggle password visibility
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Check if password meets all requirements
  const isPasswordValid = passwordErrors.length === 0 && newPassword.length > 0;

  if (!isValidToken) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-box">
          <div className="reset-password-header">
            <h2>Invalid Reset Link</h2>
            <p>{message || "The reset link is invalid or has expired."}</p>
            <button 
              onClick={() => navigate("/")}
              className="back-to-login-button"
            >
              Back to Login
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
          <h2>Reset Your Password</h2>
          <p>Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          {/* New Password Field with Toggle */}
          <div className={`form-group ${newPassword ? "floating" : ""}`}>
            <input
              type={showNewPassword ? "text" : "password"}
              className="form-input"
              placeholder=""
              value={newPassword}
              onChange={handlePasswordChange}
              required
              minLength="8"
            />
            <label className="form-label">New Password</label>
            <button
              type="button"
              className="password-toggle"
              onClick={toggleNewPasswordVisibility}
              tabIndex="-1"
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Password Requirements */}
          {newPassword && (
            <div className="password-requirements">
              <h4>Password Requirements:</h4>
              <ul>
                <li className={newPassword.length >= 8 ? "valid" : "invalid"}>
                  {newPassword.length >= 8 ? "✓" : "✗"} At least 8 characters
                </li>
                <li className={/(?=.*[A-Z])/.test(newPassword) ? "valid" : "invalid"}>
                  {/(?=.*[A-Z])/.test(newPassword) ? "✓" : "✗"} At least one uppercase letter
                </li>
                <li className={/(?=.*[a-z])/.test(newPassword) ? "valid" : "invalid"}>
                  {/(?=.*[a-z])/.test(newPassword) ? "✓" : "✗"} At least one lowercase letter
                </li>
                <li className={/(?=.*\d)/.test(newPassword) ? "valid" : "invalid"}>
                  {/(?=.*\d)/.test(newPassword) ? "✓" : "✗"} At least one number
                </li>
                <li className={/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(newPassword) ? "valid" : "invalid"}>
                  {/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(newPassword) ? "✓" : "✗"} At least one special character
                </li>
              </ul>
            </div>
          )}

          {/* Confirm Password Field with Toggle */}
          <div className={`form-group ${confirmPassword ? "floating" : ""}`}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="form-input"
              placeholder=""
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
              tabIndex="-1"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Passwords Match Indicator */}
          {confirmPassword && (
            <div className={`password-match ${newPassword === confirmPassword ? "valid" : "invalid"}`}>
              {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
            </div>
          )}

          <button
            type="submit"
            className={`reset-button ${isLoading ? "loading" : ""} ${!isPasswordValid || newPassword !== confirmPassword ? "disabled" : ""}`}
            disabled={isLoading || !isPasswordValid || newPassword !== confirmPassword}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes("successfully") ? "success" : "error"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;