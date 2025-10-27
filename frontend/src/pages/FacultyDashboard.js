import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FacultyDashboard.css';

function FacultyDashboard() {
  const [departmentAccess, setDepartmentAccess] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const getAuthHeaders = () => {
    const token = localStorage.getItem('facultyToken');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  useEffect(() => {
    fetchDepartmentAccess();
  }, []);

  const fetchDepartmentAccess = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/faculty/department-access`,
        getAuthHeaders());
      setDepartmentAccess(res.data);
      setLoading(false);
    } catch (err) {
      setMessage('Failed to fetch department access status.');
      setLoading(false);
    }
  };

  const handleToggleAccess = async (department) => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/faculty/department-access/${department}`
        , {}, getAuthHeaders()
      );
      setDepartmentAccess(prev => ({
        ...prev,
        [department]: res.data.accessGranted
      }));
      setMessage(res.data.message);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update department access.');
    }
  };

  const departmentNames = {
    'IT': 'Information Technology',
    'CSE': 'Computer Science & Engineering',
    'CIVIL': 'Civil Engineering',
    'EEE': 'Electrical & Electronics Engineering',
    'ECE': 'Electronics & Communication Engineering',
    'MECH': 'Mechanical Engineering',
    'PROD': 'Production Engineering',
    'CHEM': 'Chemical Engineering',
    'BIO-TECH': 'Bio Technology',
    'AIDS': 'Artificial Intelligence & Data Science',
    'IOT-CS': 'IoT & Cyber Security',
    'AIML': 'Artificial Intelligence & Machine Learning'
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Faculty Dashboard</h1>
        <p>Manage Department View Access</p>
        <p className="dashboard-subtitle">
          Grant view and download access to entire departments. Students can view and download projects but cannot upload.
        </p>
      </header>
      
      {message && (
        <div className={`message ${message.includes('granted') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      
      {loading ? (
        <div className="loading">Loading department access...</div>
      ) : (
        <div className="department-access-container">
          <h2>Department Access Control</h2>
          <div className="department-grid">
            {Object.entries(departmentAccess).map(([dept, hasAccess]) => (
              <div key={dept} className="department-card">
                <div className="department-info">
                  <h3 className="department-name">{departmentNames[dept] || dept}</h3>
                  <span className="department-code">({dept})</span>
                </div>
                <div className="access-status">
                  <span className={`status ${hasAccess ? 'granted' : 'revoked'}`}>
                    {hasAccess ? '🔓 View Access Granted' : '🔒 View Access Revoked'}
                  </span>
                </div>
                <button
                  className={`toggle-btn ${hasAccess ? 'revoke' : 'grant'}`}
                  onClick={() => handleToggleAccess(dept)}
                >
                  {hasAccess ? 'Revoke View Access' : 'Grant View Access'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyDashboard;