import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FacultyDashboard.css';

function FacultyDashboard() {
  const [isAccessGranted, setIsAccessGranted] = useState(null);
  const [error, setError] = useState('');
  const DUMMY_STUDENT_ROLL = '160123737141';

  useEffect(() => {
    const fetchAccessStatus = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/faculty/dummy-student/status`);
        setIsAccessGranted(res.data.isAccessGranted);
      } catch (err) {
        setError('Failed to fetch student access status.');
      }
    };
    fetchAccessStatus();
  }, []);

  const handleToggleAccess = async () => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/faculty/dummy-student/toggle-access`);
      setIsAccessGranted(res.data.isAccessGranted);
    } catch (err) {
      alert('Failed to update access.');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Faculty Dashboard</h1>
        <p>Manage Dummy Student Access</p>
      </header>
      
      {error && <p className="error-message">{error}</p>}
      
      {isAccessGranted !== null ? (
        <div className="student-card">
          <div className="student-info">
            <span className="roll-number-label">Student Roll No:</span>
            <span className="roll-number-value">{DUMMY_STUDENT_ROLL}</span>
          </div>
          <div className="access-status">
            <span className="status-label">Current Status:</span>
            <span className={`status ${isAccessGranted ? 'approved' : 'pending'}`}>
              {isAccessGranted ? 'Access Granted' : 'Access Revoked'}
            </span>
          </div>
          <button
            className={`toggle-btn ${isAccessGranted ? 'revoke' : 'grant'}`}
            onClick={handleToggleAccess}
          >
            {isAccessGranted ? 'Revoke Access' : 'Grant Access'}
          </button>
        </div>
      ) : (
        !error && <p>Loading student data...</p>
      )}
    </div>
  );
}

export default FacultyDashboard;

