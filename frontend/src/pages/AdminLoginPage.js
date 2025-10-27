import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Hardcoded credentials
    const ADMIN_EMAIL = 'xyz@gmail.com';
    const ADMIN_PASSWORD = '12345';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem('adminToken', 'fake-token-123'); // dummy token
      navigate('/admin-dashboard');
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="login-container">


      <div className="login-box">
        <div className="login-header">
          <h2>Admin Login</h2>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email" className="form-label">
              Email
            </label>
          </div>

          <div className="form-group">
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password" className="form-label">
              Password
            </label>
          </div>

          <button type="submit" className="login-button">
            Login
          </button>

          {error && <div className="message error">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
