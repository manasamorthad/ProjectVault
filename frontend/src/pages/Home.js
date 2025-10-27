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
  '749': 'B.E- INTERNET OF THINGS AND CYBER SECURITY',
  '729': 'B.E- ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING'
};

// Short form branch names for filtering
const BRANCH_SHORT_FORMS = {
  'B.E- CIVIL ENGINEERING': 'CIVIL',
  'B.E- COMPUTER SCIENCE AND ENGG.': 'CSE',
  'B.E- ELECTRICAL & ELECTRONICS ENGG.': 'EEE',
  'B.E- ELECTRONICS & COMMUNICATION ENGG.': 'ECE',
  'B.E- MECHANICAL ENGINEERING': 'MECH',
  'B.E- INFORMATION TECHNOLOGY': 'IT',
  'B.E- PRODUCTION ENGINEERING': 'PROD',
  'B.TECH- CHEMICAL ENGINEERING': 'CHEM',
  'B.TECH- BIO TECHNOLOGY': 'BIO-TECH',
  'B.E- ARTIFICIAL INTELLIGENCE AND DATA SCIENCE': 'AIDS',
  'B.E- INTERNET OF THINGS AND CYBER SECURITY': 'IOT-CS',
  'B.E- ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING': 'AIML'
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

const ALL_BRANCHES = Object.values(BRANCH_SHORT_FORMS);

function Home() {
  const [projects, setProjects] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterDomain, setFilterDomain] = useState('all');
  const [filterAcademicYear, setFilterAcademicYear] = useState('all');
  const [sortAcademicYear, setSortAcademicYear] = useState('none');
  const [loggedInStudent, setLoggedInStudent] = useState(null);
  const [hasAccess, setHasAccess] = useState(true);
  const [hasViewAccess, setHasViewAccess] = useState(true);
  const [projectStatus, setProjectStatus] = useState({
    'mini-I': false,
    'mini-II': false,
    'major': false
  });
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    projectType: 'mini-I',
    description: '',
    domain: '',
    studentName: '',
    email: '',
    githubLink: '',
    publishedLink: '',
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
      setLoggedInStudent(null);
      setHasViewAccess(true);
      return;
    }

    const branch = extractBranchFromRollNo(studentRollNo);
    const academicYear = extractAcademicYearFromRollNo(studentRollNo);
    setLoggedInStudent({
      rollNo: studentRollNo,
      branch,
      academicYear,
    });

    // Fetch project status
    fetchProjectStatus(studentRollNo);

    // Check view access for the student's department
    axios.get(`${API_URL}/faculty/student-view-access/${studentRollNo}`)
      .then((res) => {
        setHasViewAccess(res.data.hasViewAccess);
      })
      .catch((err) => {
        console.warn("Failed to fetch view access status:", err.message);
        setHasViewAccess(true);
      });

  }, []);

  const fetchProjectStatus = async (rollNo) => {
    try {
      const response = await axios.get(`${API_URL}/projects/student-status/${rollNo}`);
      setProjectStatus(response.data);
    } catch (error) {
      console.error('Error fetching project status:', error);
    }
  };

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
          domain: filterDomain !== 'all' ? filterDomain : undefined,
          academicYear: filterAcademicYear !== 'all' ? filterAcademicYear : undefined,
          sort: sortAcademicYear !== 'none' ? sortAcademicYear : undefined
        },
      });
      
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      alert('Failed to fetch projects');
    }
  }, [filterType, searchTerm, filterBranch, filterDomain, filterAcademicYear, sortAcademicYear]);

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

    // Check if project type already uploaded
    if (projectStatus[formData.projectType]) {
      alert(`You have already uploaded a ${formData.projectType} project`);
      return;
    }

    const data = new FormData();
    data.append('projectName', formData.projectName);
    data.append('projectType', formData.projectType);
    data.append('description', formData.description);
    data.append('domain', formData.domain);
    data.append('studentName', formData.studentName);
    data.append('email', formData.email);
    data.append('rollNo', loggedInStudent.rollNo);
    data.append('branch', loggedInStudent.branch);
    data.append('academicYear', loggedInStudent.academicYear);
    data.append('githubLink', formData.githubLink);
    data.append('publishedLink', formData.publishedLink);
    data.append('reportFile', formData.reportFile);

    try {
      await axios.post(`${API_URL}/projects`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Project uploaded successfully!');
      setShowUploadForm(false);
      setFormData({
        projectName: '',
        projectType: 'mini-I',
        description: '',
        domain: '',
        studentName: '',
        email: '',
        githubLink: '',
        publishedLink: '',
        reportFile: null,
      });
      fetchProjects();
      fetchProjectStatus(loggedInStudent.rollNo);
    } catch (error) {
      console.error('Error uploading project:', error);
      alert('Failed to upload project: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDownload = async (filename, projectName) => {
    try {
      // If it's a Google Drive link, open in new tab
      if (filename.startsWith('http')) {
        window.open(filename, '_blank');
        return;
      }

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

  // Handle description click
  const handleDescriptionClick = (description) => {
    setSelectedDescription(description);
    setShowDescriptionModal(true);
  };

  // Close description modal
  const closeDescriptionModal = () => {
    setShowDescriptionModal(false);
    setSelectedDescription(null);
  };

  const availableAcademicYears = getAvailableAcademicYears();

  const handleLogout = () => {
    localStorage.removeItem("studentRollNo");
    window.location.href = "/";
  };

  return (
    <div>
      {!hasAccess && (
        <div className="access-overlay">
          <p>Access Revoked by Faculty</p>
        </div>
      )}
      {!hasViewAccess && (
        <div className="access-overlay">
          <p>View access restricted for your department. Contact faculty for access.</p>
        </div>
      )}
      <div className={`App ${!hasAccess || !hasViewAccess ? 'blurred' : ''}`}>
        <header className="header">
          <div className="header-content">
            <div className="header-text">
              <h1>Student Projects Repository</h1>
              <p>Share and explore student projects</p>
            </div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <div className="container">
          <div className="controls">
            {hasViewAccess && loggedInStudent && (
              <button className="upload-btn" onClick={() => setShowUploadForm(!showUploadForm)}>
                {showUploadForm ? 'Close' : 'Upload Project'}
              </button>
            )}
            <div className="filters">
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Projects</option>
                <option value="mini-I">Mini Project I</option>
                <option value="mini-II">Mini Project II</option>
                <option value="major">Major Project</option>
              </select>

              <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
                <option value="all">All Branches</option>
                {ALL_BRANCHES.map((branch, index) => (
                  <option key={index} value={branch}>{branch}</option>
                ))}
              </select>

              <select value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)}>
                <option value="all">All Domains</option>
                {DOMAIN_OPTIONS.map((domain, index) => (
                  <option key={index} value={domain}>{domain}</option>
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
            <div className="upload-modal-overlay">
              <div className="upload-modal">
                <div className="upload-modal-header">
                  <h2>Upload New Project</h2>
                  <button 
                    className="close-modal-btn"
                    onClick={() => setShowUploadForm(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="upload-form">
                  {/* Student Info Display with Project Status */}
                  <div className="student-info-display">
                    <h4>Student Information & Project Status</h4>
                    <div className="student-info-grid">
                      <div className="info-item">
                        <span className="info-label">Roll No:</span>
                        <span className="info-value">{loggedInStudent.rollNo}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Branch:</span>
                        <span className="info-value">{loggedInStudent.branch}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Academic Year:</span>
                        <span className="info-value">{loggedInStudent.academicYear}</span>
                      </div>
                    </div>
                    <div className="project-status">
                      <h5>Project Upload Status:</h5>
                      <div className="status-grid">
                        <div className={`status-item ${projectStatus['mini-I'] ? 'completed' : 'pending'}`}>
                          <span className="status-icon">
                            {projectStatus['mini-I'] ? '✓' : '○'}
                          </span>
                          <span>Mini Project I</span>
                        </div>
                        <div className={`status-item ${projectStatus['mini-II'] ? 'completed' : 'pending'}`}>
                          <span className="status-icon">
                            {projectStatus['mini-II'] ? '✓' : '○'}
                          </span>
                          <span>Mini Project II</span>
                        </div>
                        <div className={`status-item ${projectStatus['major'] ? 'completed' : 'pending'}`}>
                          <span className="status-icon">
                            {projectStatus['major'] ? '✓' : '○'}
                          </span>
                          <span>Major Project</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="form-section">
                      <div className="form-section-title">Project Details</div>
                      <div className="form-row-three">
                        <div className="form-group">
                          <label>Project Name *</label>
                          <input
                            type="text"
                            name="projectName"
                            value={formData.projectName}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter project name"
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
                          {projectStatus[formData.projectType] && (
                            <div className="warning-text">
                              You have already uploaded a {formData.projectType} project
                            </div>
                          )}
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
                          placeholder="Describe your project in detail..."
                        />
                      </div>
                    </div>

                    <div className="form-section">
                      <div className="form-section-title">Student Information</div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Student Name *</label>
                          <input
                            type="text"
                            name="studentName"
                            value={formData.studentName}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your full name"
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
                            placeholder="Enter your email address"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <div className="form-section-title">Project Links</div>
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
                    </div>

                    <div className="form-section">
                      <div className="form-section-title">Report File</div>
                      <div className="form-group">
                        <label>Upload Report (PDF) *</label>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="submit-btn-container">
                      <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={projectStatus[formData.projectType]}
                      >
                        {projectStatus[formData.projectType] ? 
                          'Already Uploaded' : 'Submit Project'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Description Modal */}
          {showDescriptionModal && (
            <div className="description-modal-overlay">
              <div className="description-modal">
                <div className="description-modal-header">
                  <h3>Project Description</h3>
                  <button 
                    className="close-modal-btn"
                    onClick={closeDescriptionModal}
                  >
                    ×
                  </button>
                </div>
                <div className="description-modal-content">
                  <p>{selectedDescription}</p>
                </div>
                <div className="description-modal-footer">
                  <button 
                    className="close-btn"
                    onClick={closeDescriptionModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="projects-table-container">
            {projects.length === 0 ? (
              <div className="no-projects">
                <p>No projects found. Be the first to upload!</p>
              </div>
            ) : (
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Type</th>
                    <th>Domain</th>
                    <th>Description</th>
                    <th>Student</th>
                    <th>Branch</th>
                    <th>Academic Year</th>
                    <th>Links</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project._id} className="table-row">
                      <td className="project-name-cell">
                        <div className="project-name-content">
                          <strong>{project.projectName}</strong>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${project.projectType}`}>
                          {project.projectType.toUpperCase()}
                        </span>
                      </td>
                      <td>{project.domain}</td>
                      <td 
                        className="description-cell clickable"
                        onClick={() => handleDescriptionClick(project.description)}
                        title="Click to view full description"
                      >
                        <div className="description-text">{project.description}</div>
                      </td>
                      <td className="student-info-cell">
                        <div><strong>{project.studentName}</strong></div>
                        <div className="email">{project.email}</div>
                        <div className="rollno">{project.rollNo}</div>
                      </td>
                      <td>{project.branchShort || BRANCH_SHORT_FORMS[project.branch] || project.branch}</td>
                      <td>{project.academicYear}</td>
                      <td className="links-cell">
                        <div className="links-container">
                          {/* Show GitHub Link */}
                          {project.githubLink ? (
                            <a 
                              href={project.githubLink} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="link-btn github"
                              title="GitHub Repository"
                            >
                              GitHub
                            </a>
                          ) : (
                            <span className="no-link">No GitHub</span>
                          )}
                          
                          {/* Show Published Link */}
                          {project.publishedLink ? (
                            <a 
                              href={project.publishedLink} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="link-btn published"
                              title="Live Demo"
                            >
                              Published Link
                            </a>
                          ) : (
                            <span className="no-link">Not Published</span>
                          )}
                        </div>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="download-btn"
                          onClick={() => handleDownload(project.reportFile, project.projectName)}
                          title={project.reportFile.startsWith('http') ? 'View Report' : 'Download Report'}
                        >
                          {project.reportFile.startsWith('http') ? 'View' : 'Download'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;