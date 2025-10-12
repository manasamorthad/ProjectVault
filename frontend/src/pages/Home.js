import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import "./Home.css";

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
  '748': 'B.E- COMPUTER SCIENCE AND ENGINEERING (ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING)',
  '749': 'B.E- COMPUTER SCIENCE AND ENGINEERING (INTERNET OF THINGS AND CYBER SECURITY INCLUDING BLOCK CHAIN TECHNOLOGY)',
  '729': 'B.E- ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING'
};

const ALL_BRANCHES = Object.values(PROGRAMME_CODES);

function Home() {
  const [projects, setProjects] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterAcademicYear, setFilterAcademicYear] = useState('all');
  const [sortAcademicYear, setSortAcademicYear] = useState('none');
  const [loggedInStudent, setLoggedInStudent] = useState(null);
  const [hasAccess, setHasAccess] = useState(true);

  const [formData, setFormData] = useState({
    projectName: '',
    projectType: 'mini',
    description: '',
    techStack: '',
    studentName: '',
    email: '',
    githubLink: '',
    reportFile: null,
  });

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

useEffect(() => {
  const studentRollNo = localStorage.getItem("studentRollNo");

  if (!studentRollNo) {
    // Default to a non-dummy state if no one is logged in
    setLoggedInStudent(null);
    setHasAccess(true); // Or false, depending on desired default behavior
    return;
  }

  const branch = extractBranchFromRollNo(studentRollNo);
  const academicYear = extractAcademicYearFromRollNo(studentRollNo);
  setLoggedInStudent({
    rollNo: studentRollNo,
    branch,
    academicYear,
  });

  // Corrected Logic:
  // Check if the logged-in user is the dummy student
  if (studentRollNo === '160123737141') {
    axios.get(`${API_URL}/faculty/dummy-student/status`)
      .then((res) => {
        setHasAccess(res.data.isAccessGranted);
      })
      .catch((err) => {
        console.warn("Failed to fetch access status:", err.message);
        setHasAccess(false); // Default to no access on error
      });
  } else {
    // Any other student has access by default
    setHasAccess(true);
  }
}, []);


  // Get academic years that actually have projects
  const getAvailableAcademicYears = () => {
    const yearsWithProjects = [...new Set(projects.map(p => p.academicYear).filter(year => year && year !== ''))];
    return ['all', ...yearsWithProjects];
  };

  // Fetch projects from API
  const fetchProjects = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`, {
        params: { 
          type: filterType !== 'all' ? filterType : undefined,
          search: searchTerm || undefined,
          branch: filterBranch !== 'all' ? filterBranch : undefined,
          academicYear: filterAcademicYear !== 'all' ? filterAcademicYear : undefined,
          sort: sortAcademicYear !== 'none' ? sortAcademicYear : undefined
        },
      });
      
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      alert('Failed to fetch projects');
    }
  }, [filterType, searchTerm, filterBranch, filterAcademicYear, sortAcademicYear]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, reportFile: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loggedInStudent) {
      alert('Please login first');
      return;
    }

    const data = new FormData();
    data.append('projectName', formData.projectName);
    data.append('projectType', formData.projectType);
    data.append('description', formData.description);
    data.append('techStack', JSON.stringify(formData.techStack.split(',').map(t => t.trim())));
    data.append('studentName', formData.studentName);
    data.append('email', formData.email);
    data.append('rollNo', loggedInStudent.rollNo);
    data.append('branch', loggedInStudent.branch);
    data.append('academicYear', loggedInStudent.academicYear);
    data.append('githubLink', formData.githubLink);
    data.append('reportFile', formData.reportFile);

    try {
      await axios.post(`${API_URL}/projects`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Project uploaded successfully!');
      setShowUploadForm(false);
      setFormData({
        projectName: '',
        projectType: 'mini',
        description: '',
        techStack: '',
        studentName: '',
        email: '',
        githubLink: '',
        reportFile: null,
      });
      fetchProjects();
    } catch (error) {
      console.error('Error uploading project:', error);
      alert('Failed to upload project: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDownload = async (filename, projectName) => {
    try {
      const response = await axios.get(`${API_URL}/projects/download/${filename}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${projectName}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download report');
    }
  };

  const availableAcademicYears = getAvailableAcademicYears();

return (
  <div>
    {!hasAccess && (
      <div className="access-overlay">
        <p>Access Revoked by Faculty</p>
      </div>
    )}
    <div className={`App ${!hasAccess ? 'blurred' : ''}`}>
      <header className="header">
        <h1>📚 Student Projects Repository</h1>
        <p>Share and explore student projects</p>
      </header>

      <div className="container">
        <div className="controls">
          <button className="upload-btn" onClick={() => setShowUploadForm(!showUploadForm)}>
            {showUploadForm ? '✖ Close' : '➕ Upload Project'}
          </button>

          <div className="filters">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Projects</option>
              <option value="mini">Mini Projects</option>
              <option value="major">Major Projects</option>
            </select>

            <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
              <option value="all">All Branches</option>
              {ALL_BRANCHES.map((branch, index) => (
                <option key={index} value={branch}>{branch}</option>
              ))}
            </select>

            <select value={filterAcademicYear} onChange={(e) => setFilterAcademicYear(e.target.value)}>
              <option value="all">All Academic Years</option>
              {availableAcademicYears
                .filter(year => year !== 'all')
                .sort((a, b) => b.localeCompare(a))
                .map((year, index) => (
                  <option key={index} value={year}>{year}</option>
                ))
              }
            </select>

            <select value={sortAcademicYear} onChange={(e) => setSortAcademicYear(e.target.value)}>
              <option value="none">Sort by Year</option>
              <option value="asc">Academic Year (Oldest First)</option>
              <option value="desc">Academic Year (Newest First)</option>
            </select>

            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {showUploadForm && loggedInStudent && (
          <div className="upload-form">
            <h2>Upload New Project</h2>

            {/* Student Info Display */}
            <div className="student-info-display">
              <h4>Student Information (Auto-detected)</h4>
              <div className="info-row">
                <span className="info-label">Roll No:</span>
                <span className="info-value">{loggedInStudent.rollNo}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Branch:</span>
                <span className="info-value">{loggedInStudent.branch}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Academic Year:</span>
                <span className="info-value">{loggedInStudent.academicYear}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
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
                    <option value="mini">Mini Project</option>
                    <option value="major">Major Project</option>
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

              <div className="form-group">
                <label>Tech Stack (comma separated) *</label>
                <input
                  type="text"
                  name="techStack"
                  value={formData.techStack}
                  onChange={handleInputChange}
                  placeholder="e.g., React, Node.js, MongoDB"
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
                <label>Upload Report (PDF) *</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                />
              </div>

              <button type="submit" className="submit-btn">
                Submit Project
              </button>
            </form>
          </div>
        )}

        <div className="projects-grid">
          {projects.length === 0 ? (
            <div className="no-projects">
              <p>No projects found. Be the first to upload!</p>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project._id} className="project-card">
                <div className="project-header">
                  <h3>{project.projectName}</h3>
                  <span className={`badge ${project.projectType}`}>
                    {project.projectType.toUpperCase()}
                  </span>
                </div>

                <p className="description">{project.description}</p>

                <div className="tech-stack">
                  {project.techStack && project.techStack.map((tech, index) => (
                    <span key={index} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="project-meta">
                  {project.branch && (
                    <span className="branch-tag">🏛️ {project.branch}</span>
                  )}
                  {project.academicYear && (
                    <span className="year-tag">🎓 {project.academicYear}</span>
                  )}
                </div>

                <div className="project-footer">
                  <div className="student-info">
                    <p><strong>👤 {project.studentName}</strong></p>
                    <p className="email">✉ {project.email}</p>
                    {project.rollNo && <p className="rollno">🔢 {project.rollNo}</p>}
                    <p className="date">
                      📅 {new Date(project.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="project-actions">
                    {project.githubLink && (
                      <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="github-link">
                        🔗 GitHub
                      </a>
                    )}
                    <button
                      className="download-btn"
                      onClick={() => handleDownload(project.reportFile, project.projectName)}
                    >
                      📥 Download Report
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

export default Home;
