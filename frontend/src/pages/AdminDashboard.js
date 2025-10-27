import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as xlsx from 'xlsx';
import './AdminDashboard.css';

const API_URL = 'http://localhost:5000/api';

// Programme codes mapping
const PROGRAMME_CODES = {
  '732': 'B.E- CIVIL ENGINEERING',
  '733': 'B.E- COMPUTER SCIENCE AND ENGG.',
  '734': 'B.E- ELECTRICAL & ELECTRONICS ENGG.',
  '735': 'B.E- ELECTRONICS & COMMUNICATION ENGG.',
  '736': 'B.E- MECHANICAL ENGINEERING',
  '737': 'B.E- INFORMATION TECHNOLOGY',
  '738': 'B.E- PRODUCTION ENGINEERING',
  '802': 'B.TECH- CHEMICAL ENGINEERING',
  '805': 'B.TECH- BIO TECHNOLOGY',
  '771': 'B.E- ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
  '749': 'B.E- INTERNET OF THINGS AND CYBER SECURITY',
  '729': 'B.E- ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING'
};

// Domain options
const DOMAIN_OPTIONS = [
  'Full Stack',
  'MERN Stack',
  'MEAN Stack',
  'Machine Learning',
  'Artificial Intelligence',
  'Data Science',
  'Internet of Things',
  'Cyber Security',
  'Cloud Computing',
  'Mobile Development',
  'Web Development',
  'Blockchain',
  'DevOps',
  'Data Analytics',
  'Computer Vision',
  'Natural Language Processing',
  'Other'
];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('single');
  const [formData, setFormData] = useState({
    projectName: '',
    projectType: 'mini-I',
    description: '',
    domain: '',
    studentName: '',
    email: '',
    rollNo: '',
    branch: '',
    academicYear: '',
    githubLink: '',
    publishedLink: '',
    reportFile: null,
  });
  const [excelFile, setExcelFile] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // New states for user management
  const [studentsFile, setStudentsFile] = useState(null);
  const [facultyFile, setFacultyFile] = useState(null);
  const [userUploadResults, setUserUploadResults] = useState(null);
  const [isUserUploading, setIsUserUploading] = useState(false);

  // Extract branch from roll number
  const extractBranchFromRollNo = (rollNo) => {
    if (rollNo.length >= 12) {
      const branchCode = rollNo.substring(6, 9);
      return PROGRAMME_CODES[branchCode] || 'Unknown Branch';
    }
    return 'Unknown Branch';
  };

  // Extract academic year from roll number (format: 2023-27)
  const extractAcademicYearFromRollNo = (rollNo) => {
    if (rollNo.length >= 12) {
      const yearCode = rollNo.substring(4, 6);
      const baseYear = 2000 + parseInt(yearCode);
      return `${baseYear}-${(baseYear + 4).toString().slice(-2)}`;
    }
    return 'Unknown';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-fill branch and academic year when roll number is entered
    if (name === 'rollNo' && value.length >= 12) {
      const branch = extractBranchFromRollNo(value);
      const academicYear = extractAcademicYearFromRollNo(value);
      
      setFormData(prev => ({
        ...prev,
        branch: branch,
        academicYear: academicYear
      }));
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, reportFile: e.target.files[0] });
  };

  const handleExcelFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const handleStudentsFileChange = (e) => {
    setStudentsFile(e.target.files[0]);
  };

  const handleFacultyFileChange = (e) => {
    setFacultyFile(e.target.files[0]);
  };

  const handleSingleUpload = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    const data = new FormData();
    data.append('projectName', formData.projectName);
    data.append('projectType', formData.projectType);
    data.append('description', formData.description);
    data.append('domain', formData.domain);
    data.append('studentName', formData.studentName);
    data.append('email', formData.email);
    data.append('rollNo', formData.rollNo);
    data.append('branch', formData.branch);
    data.append('academicYear', formData.academicYear);
    data.append('githubLink', formData.githubLink);
    data.append('publishedLink', formData.publishedLink);
    data.append('reportFile', formData.reportFile);
    data.append('uploadedByAdmin', 'true');

    try {
      await axios.post(`${API_URL}/projects`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Project uploaded successfully!');
      setFormData({
        projectName: '',
        projectType: 'mini-I',
        description: '',
        domain: '',
        studentName: '',
        email: '',
        rollNo: '',
        branch: '',
        academicYear: '',
        githubLink: '',
        publishedLink: '',
        reportFile: null,
      });
    } catch (error) {
      console.error('Error uploading project:', error);
      alert('Failed to upload project: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      alert('Please select an Excel file');
      return;
    }

    setIsUploading(true);
    const data = new FormData();
    data.append('excelFile', excelFile);

    try {
      const response = await axios.post(`${API_URL}/projects/bulk-upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResults(response.data);
      alert('Bulk upload completed!');
      setExcelFile(null);
    } catch (error) {
      console.error('Error in bulk upload:', error);
      alert('Failed to upload: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleStudentsUpload = async (e) => {
    e.preventDefault();
    if (!studentsFile) {
      alert('Please select a CSV file with student roll numbers');
      return;
    }

    setIsUserUploading(true);
    const data = new FormData();
    data.append('studentsFile', studentsFile);

    try {
      const response = await axios.post(`${API_URL}/admin/upload-students`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUserUploadResults(response.data);
      alert('Students uploaded successfully!');
      setStudentsFile(null);
    } catch (error) {
      console.error('Error uploading students:', error);
      alert('Failed to upload students: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUserUploading(false);
    }
  };

  const handleFacultyUpload = async (e) => {
    e.preventDefault();
    if (!facultyFile) {
      alert('Please select a CSV file with faculty emails');
      return;
    }

    setIsUserUploading(true);
    const data = new FormData();
    data.append('facultyFile', facultyFile);

    try {
      const response = await axios.post(`${API_URL}/admin/upload-faculty`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUserUploadResults(response.data);
      alert('Faculty uploaded successfully!');
      setFacultyFile(null);
    } catch (error) {
      console.error('Error uploading faculty:', error);
      alert('Failed to upload faculty: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUserUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'projectName': 'Sample Project',
        'projectType': 'mini-I',
        'description': 'Project description',
        'domain': 'Web Development',
        'studentName': 'Student Name',
        'email': 'student@email.com',
        'rollNo': '2023BCS001',
        'branch': 'B.E- COMPUTER SCIENCE AND ENGG.',
        'academicYear': '2023-27',
        'githubLink': 'https://github.com/username/repo',
        'publishedLink': 'https://project-link.com',
        'reportFile': 'https://drive.google.com/your-report-link'
      }
    ];

    const ws = xlsx.utils.json_to_sheet(template);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Template');
    xlsx.writeFile(wb, 'project-upload-template.xlsx');
  };

  const downloadStudentsTemplate = () => {
    const template = [
      {
        'rollNo': '2023BCS001'
      },
      {
        'rollNo': '2023BCS002'
      },
      {
        'rollNo': '2023BCS003'
      }
    ];

    const ws = xlsx.utils.json_to_sheet(template);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Students');
    xlsx.writeFile(wb, 'students-template.csv');
  };

  const downloadFacultyTemplate = () => {
    const template = [
      {
        'email': 'faculty1@cbit.ac.in'
      },
      {
        'email': 'faculty2@cbit.ac.in'
      },
      {
        'email': 'faculty3@cbit.ac.in'
      }
    ];

    const ws = xlsx.utils.json_to_sheet(template);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Faculty');
    xlsx.writeFile(wb, 'faculty-template.csv');
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>🎯 Admin Dashboard</h1>
          <p>Manage student projects and users</p>
        </div>
      </header>

      <div className="admin-container">
        <div className="admin-tabs">
          <button 
            className={`tab-button ${activeTab === 'single' ? 'active' : ''}`}
            onClick={() => setActiveTab('single')}
          >
            Single Upload
          </button>
          <button 
            className={`tab-button ${activeTab === 'bulk' ? 'active' : ''}`}
            onClick={() => setActiveTab('bulk')}
          >
            Bulk Upload
          </button>
          <button 
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Manage Users
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'single' && (
            <div className="upload-section">
              <h2>Upload Single Project</h2>
              <form onSubmit={handleSingleUpload} className="admin-form">
                <div className="form-row-three">
                  <div className="form-group">
                    <label>Project Name *</label>
                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Project Type *</label>
                    <select
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="mini-I">Mini Project I</option>
                      <option value="mini-II">Mini Project II</option>
                      <option value="major">Major Project</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Domain *</label>
                    <select
                      name="domain"
                      value={formData.domain}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Domain</option>
                      {DOMAIN_OPTIONS.map((domain, index) => (
                        <option key={index} value={domain}>{domain}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Student Name *</label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Roll No *</label>
                    <input
                      type="text"
                      name="rollNo"
                      value={formData.rollNo}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Branch *</label>
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      required
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label>Academic Year *</label>
                    <input
                      type="text"
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleInputChange}
                      required
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>GitHub Link (Optional)</label>
                  <input
                    type="url"
                    name="githubLink"
                    value={formData.githubLink}
                    onChange={handleInputChange}
                    placeholder="https://github.com/username/repository"
                  />
                </div>

                <div className="form-group">
                  <label>Published Link (Optional)</label>
                  <input
                    type="url"
                    name="publishedLink"
                    value={formData.publishedLink}
                    onChange={handleInputChange}
                    placeholder="https://your-project.com"
                  />
                </div>

                <div className="form-group">
                  <label>Upload Report (PDF) *</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload Project'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'bulk' && (
            <div className="upload-section">
              <h2>Bulk Upload Projects</h2>
              
              <div className="bulk-upload-info">
                <h3>Instructions:</h3>
                <ul>
                  <li>Download the template Excel file below</li>
                  <li>Fill in the project details following the template format</li>
                  <li>For report files, provide Google Drive shareable links</li>
                  <li>Ensure all required fields are filled</li>
                  <li>Upload the completed Excel file</li>
                </ul>

                <button 
                  className="download-template-btn"
                  onClick={downloadTemplate}
                >
                  📥 Download Template
                </button>
              </div>

              <form onSubmit={handleBulkUpload} className="bulk-upload-form">
                <div className="form-group">
                  <label>Upload Excel File *</label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelFileChange}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isUploading || !excelFile}
                >
                  {isUploading ? 'Processing...' : 'Upload Excel File'}
                </button>
              </form>

              {uploadResults && (
                <div className="upload-results">
                  <h3>Upload Results:</h3>
                  <p><strong>Successful:</strong> {uploadResults.details?.successful || 0}</p>
                  <p><strong>Failed:</strong> {uploadResults.details?.failed || 0}</p>
                  
                  {uploadResults.details?.errors && uploadResults.details.errors.length > 0 && (
                    <div className="errors-list">
                      <h4>Errors:</h4>
                      {uploadResults.details.errors.map((error, index) => (
                        <div key={index} className="error-item">
                          <strong>{error.row}:</strong> {error.error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="upload-section">
              <h2>Manage Users</h2>
              
              <div className="users-management">
                <div className="user-type-section">
                  <h3>Add Students</h3>
                  <div className="bulk-upload-info">
                    <h4>Instructions:</h4>
                    <ul>
                      <li>Download the student template CSV file</li>
                      <li>Add student roll numbers in the CSV file</li>
                      <li>Default password will be: rollNo + "P" (e.g., 2023BCS001P)</li>
                      <li>Students will have access disabled by default</li>
                      <li>Upload the CSV file to add students</li>
                    </ul>

                    <button 
                      className="download-template-btn"
                      onClick={downloadStudentsTemplate}
                    >
                      📥 Download Students Template
                    </button>
                  </div>

                  <form onSubmit={handleStudentsUpload} className="user-upload-form">
                    <div className="form-group">
                      <label>Upload Students CSV *</label>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleStudentsFileChange}
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="submit-btn"
                      disabled={isUserUploading || !studentsFile}
                    >
                      {isUserUploading ? 'Processing...' : 'Upload Students'}
                    </button>
                  </form>
                </div>

                <div className="user-type-section">
                  <h3>Add Faculty</h3>
                  <div className="bulk-upload-info">
                    <h4>Instructions:</h4>
                    <ul>
                      <li>Download the faculty template CSV file</li>
                      <li>Add faculty email addresses in the CSV file</li>
                      <li>Default password will be: "cbit123"</li>
                      <li>Faculty will have full access by default</li>
                      <li>Upload the CSV file to add faculty</li>
                    </ul>

                    <button 
                      className="download-template-btn"
                      onClick={downloadFacultyTemplate}
                    >
                      📥 Download Faculty Template
                    </button>
                  </div>

                  <form onSubmit={handleFacultyUpload} className="user-upload-form">
                    <div className="form-group">
                      <label>Upload Faculty CSV *</label>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFacultyFileChange}
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="submit-btn"
                      disabled={isUserUploading || !facultyFile}
                    >
                      {isUserUploading ? 'Processing...' : 'Upload Faculty'}
                    </button>
                  </form>
                </div>
              </div>

              {userUploadResults && (
                <div className="upload-results">
                  <h3>Upload Results:</h3>
                  <p><strong>Successful:</strong> {userUploadResults.details?.successful || 0}</p>
                  <p><strong>Failed:</strong> {userUploadResults.details?.failed || 0}</p>
                  
                  {userUploadResults.details?.errors && userUploadResults.details.errors.length > 0 && (
                    <div className="errors-list">
                      <h4>Errors:</h4>
                      {userUploadResults.details.errors.map((error, index) => (
                        <div key={index} className="error-item">
                          <strong>{error.row}:</strong> {error.error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;