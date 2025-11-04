import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import "./Home.css";

const API_URL = 'https://projectvault-2.onrender.com/api';
//const API_URL = 'http://localhost:5000/api';

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

const ACADEMIC_YEARS = [
  '2024-2028',
  '2023-2027',
  '2022-2026',
  '2021-2025'
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
    reportLink: '',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    projectName: '',
    projectType: 'mini-I',
    description: '',
    domain: '',
    studentName: '',
    email: '',
    githubLink: '',
    publishedLink: '',
    reportLink: '',
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  
  const handleProjectNameClick = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const closeProjectModal = () => {
    setShowProjectModal(false);
    setSelectedProject(null);
  };

  // Extract branch from roll number
  const extractBranchFromRollNo = (rollNo) => {
    if (rollNo.length >= 12) {
      const branchCode = rollNo.substring(6, 9);
      return PROGRAMME_CODES[branchCode] || 'Unknown Branch';
    }
    return 'Unknown Branch';
  };

  // Update this function to handle academic year extraction from roll number
  const extractAcademicYearFromRollNo = (rollNo) => {
    if (rollNo.length >= 12) {
      const yearCode = rollNo.substring(4, 6); // Extract year part (e.g., "23")
      const baseYear = 2000 + parseInt(yearCode);
      return `${baseYear}-${baseYear + 4}`; // e.g., "2023-2027"
    }
    return 'Unknown';
  };

  // Add this helper function after the ACADEMIC_YEARS constant
  const getYearFromRollNo = (rollNo) => {
    if (rollNo && rollNo.length >= 12) {
      const yearCode = rollNo.substring(4, 6);
      const baseYear = 2000 + parseInt(yearCode);
      return `${baseYear}-${baseYear + 4}`;
    }
    return null;
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

  // Helper to build a readable error message from Axios or generic errors
  const formatAxiosError = (err) => {
    console.error('Full error:', err);
    if (!err) return 'Unknown error';
    // Axios error with response
    if (err.response) {
      const status = err.response.status;
      const data = err.response.data;
      const serverMsg = data?.message || (typeof data === 'string' ? data : JSON.stringify(data)) || '';
      return `Server ${status}${serverMsg ? `: ${serverMsg}` : ''}`;
    }
    // Axios error with request but no response
    if (err.request) {
      return 'No response from server. Check network or backend.';
    }
    // Other errors
    return err.message || String(err);
  };

  const fetchProjectStatus = async (rollNo) => {
    try {
      if (!rollNo) {
        console.warn('No roll number provided for status check');
        return;
      }

      const response = await axios.get(`${API_URL}/projects/student-status/${rollNo}`);
      if (response.data && typeof response.data === 'object') {
        setProjectStatus(prevStatus => ({
          ...prevStatus,
          ...response.data
        }));
      } else {
        console.warn('Invalid status response:', response.data);
        setProjectStatus({
          'mini-I': false,
          'mini-II': false,
          'major': false
        });
      }
    } catch (error) {
      console.error('Error fetching project status:', error);
      // Don't alert on status fetch error, just reset status
      setProjectStatus({
        'mini-I': false,
        'mini-II': false,
        'major': false
      });
    }
  };

  // Get academic years that actually have projects
  const getAvailableAcademicYears = () => {
    const yearsWithProjects = [...new Set(projects.map(p => p.academicYear).filter(year => year && year !== ''))];
    const allYears = [...new Set([...ACADEMIC_YEARS, ...yearsWithProjects])];
    return ['all', ...allYears.sort((a, b) => {
      const yearA = parseInt(a.split('-')[0]);
      const yearB = parseInt(b.split('-')[0]);
      return yearB - yearA;  // Sort in descending order (newest first)
    })];
  };

  // Fetch projects from API
// Fetch projects from API
const fetchProjects = useCallback(async () => {
  try {
    const response = await axios.get(`${API_URL}/projects`, {
      params: { 
        type: filterType !== 'all' ? filterType : undefined,
        search: searchTerm || undefined,
        // Remove branch from backend params - we'll filter on frontend
        domain: filterDomain !== 'all' ? filterDomain : undefined,
      },
    });
    
    let filteredProjects = response.data.map(project => ({
      ...project,
      academicYear: getYearFromRollNo(project.rollNo) || project.academicYear,
      // Ensure branch data is consistent
      branchShort: project.branchShort || BRANCH_SHORT_FORMS[project.branch] || getBranchShortForm(project.branch)
    }));

    // Debug: Log all unique branches from the API
    const uniqueBranches = [...new Set(response.data.map(p => p.branch))];
    console.log('Available branches from API:', uniqueBranches);
    console.log('Current filter branch:', filterBranch);

    // Filter by project type if selected
    if (filterType !== 'all') {
      filteredProjects = filteredProjects.filter(project => 
        project.projectType === filterType
      );
    }

    // Filter by branch if selected - FIXED VERSION
    if (filterBranch !== 'all') {
      filteredProjects = filteredProjects.filter(project => {
        // Get the branch in short form for comparison
        const projectBranchShort = project.branchShort || BRANCH_SHORT_FORMS[project.branch] || getBranchShortForm(project.branch);
        
        console.log('Branch comparison:', {
          projectName: project.projectName,
          originalBranch: project.branch,
          computedShort: projectBranchShort,
          filterBranch: filterBranch,
          matches: projectBranchShort === filterBranch
        });
        
        return projectBranchShort === filterBranch;
      });
    }

    // Filter by domain if selected
    if (filterDomain !== 'all') {
      filteredProjects = filteredProjects.filter(project => 
        project.domain === filterDomain
      );
    }

    // Filter by academic year if selected
    if (filterAcademicYear !== 'all') {
      filteredProjects = filteredProjects.filter(project => 
        project.academicYear === filterAcademicYear
      );
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredProjects = filteredProjects.filter(project =>
        project.projectName.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.studentName.toLowerCase().includes(searchLower) ||
        project.domain.toLowerCase().includes(searchLower)
      );
    }

    // Sort by academic year if selected
    if (sortAcademicYear !== 'none') {
      filteredProjects.sort((a, b) => {
        const yearA = parseInt(a.academicYear?.split('-')[0]) || 0;
        const yearB = parseInt(b.academicYear?.split('-')[0]) || 0;
        return sortAcademicYear === 'asc' ? yearA - yearB : yearB - yearA;
      });
    }

    setProjects(filteredProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    if (error.response) {
      console.error('Backend response:', error.response.data);
    }
    alert(formatAxiosError(error));
    setProjects([]); // keep UI consistent
  }
}, [filterType, searchTerm, filterBranch, filterDomain, filterAcademicYear, sortAcademicYear]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleReportLinkChange = (e) => {
    setFormData({ ...formData, reportLink: e.target.value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Log form data for debugging
    console.log('Submitting project:', formData);

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
    data.append('reportLink', formData.reportLink);

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
        reportLink: '',
      });
      fetchProjects();
      fetchProjectStatus(loggedInStudent.rollNo);
    } catch (error) {
      // Log full error response for debugging
      console.error('Error uploading project:', error);
      if (error.response) {
        console.error('Backend response:', error.response.data);
      }
      alert(
        error.response?.data?.message ||
        error.message ||
        'Project upload failed. Please check your inputs and try again.'
      );
    }
  };
  
  // helper: find a project by logged in student + type
  const findProjectByType = (type) => {
    if (!loggedInStudent) return null;
    return projects.find(p => p.rollNo === loggedInStudent.rollNo && p.projectType === type) || null;
  };

  const openEditModal = (type) => {
    const proj = findProjectByType(type);
    if (!proj) {
      alert('No project found to edit');
      return;
    }
    setEditingProjectId(proj._id);
    setEditFormData({
      projectName: proj.projectName || '',
      projectType: proj.projectType || type,
      description: proj.description || '',
      domain: proj.domain || '',
      studentName: proj.studentName || '',
      email: proj.email || '',
      githubLink: proj.githubLink || '',
      publishedLink: proj.publishedLink || '',
      reportLink: proj.reportLink || '',
    });
    setShowEditModal(true);
  };
  
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingProjectId(null);
  };
  
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProjectId) return;

    // helper to try PUT on a single URL
    const tryPut = async (url, payload) => {
      try {
        const resp = await axios.put(url, payload, {
          headers: { 'Content-Type': 'application/json' }
        });
        return { success: true, resp };
      } catch (err) {
        return { success: false, err };
      }
    };

    // endpoints to try (primary first, then common alternatives)
    const endpoints = [
      `${API_URL}/projects/${editingProjectId}`,
      `${API_URL}/projects/update/${editingProjectId}`,
      `${API_URL}/projects/edit/${editingProjectId}`
    ];

    let result = null;
    for (const url of endpoints) {
      result = await tryPut(url, editFormData);
      if (result.success) break;
      // if 404, try next; for other statuses (401/403/500) stop and show error
      const status = result.err?.response?.status;
      if (status && status !== 404) break;
    }

    if (result && result.success) {
      alert('Project updated');
      closeEditModal();
      fetchProjects();
      if (loggedInStudent) fetchProjectStatus(loggedInStudent.rollNo);
      return;
    }

    // show helpful error
    const err = result?.err;
    console.error('Error updating project', err || 'unknown');
    alert(formatAxiosError(err));
  };
  
  const handleClearProject = async () => {
    if (!editingProjectId) return;
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

    const tryDelete = async (url) => {
      try {
        const resp = await axios.delete(url);
        return { success: true, resp };
      } catch (err) {
        return { success: false, err };
      }
    };

    // Try primary endpoint first, then a few common alternatives
    const endpoints = [
      `${API_URL}/projects/${editingProjectId}`,
      `${API_URL}/projects/delete/${editingProjectId}`,
      `${API_URL}/projects/remove/${editingProjectId}`,
    ];

    let result = null;
    for (const url of endpoints) {
      result = await tryDelete(url);
      if (result.success) break;
      // if 404 try next; for other errors we may still continue to gather better msg
      if (result.err?.response?.status !== 404) break;
    }

    if (result && result.success) {
      alert('Project deleted');
      closeEditModal();
      fetchProjects();
      if (loggedInStudent) fetchProjectStatus(loggedInStudent.rollNo);
      return;
    }

    // Build helpful error message
    const err = result?.err;
    console.error('Error deleting project', err || 'unknown');
    alert(formatAxiosError(err));
  };

  const handleDownload = async (url, projectName) => {
    // Only support external report links now
    try {
      if (!url) {
        alert('No report link available for this project.');
        return;
      }
      if (typeof url === 'string' && url.startsWith('http')) {
        window.open(url, '_blank');
        return;
      }
      alert('Invalid report link.');
    } catch (error) {
      console.error('Error opening report link:', error);
      alert(formatAxiosError(error));
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

  // Helper function to get short form of branch
const getBranchShortForm = (branchName) => {
  if (!branchName) return 'Unknown';
  
  // Clean the branch name
  const cleanBranchName = branchName.trim().toUpperCase();
  
  // Direct mapping check with cleaned name
  if (BRANCH_SHORT_FORMS[branchName]) {
    return BRANCH_SHORT_FORMS[branchName];
  }
  
  // Try to find a match by checking if the branch name contains any of our known branches
  const matchedFullName = Object.keys(BRANCH_SHORT_FORMS).find(fullName => 
    cleanBranchName.includes(fullName.toUpperCase()) || 
    fullName.toUpperCase().includes(cleanBranchName)
  );
  
  if (matchedFullName) {
    return BRANCH_SHORT_FORMS[matchedFullName];
  }
  
  // If no match found, try to match with short forms directly
  const matchedShortForm = Object.values(BRANCH_SHORT_FORMS).find(shortForm =>
    cleanBranchName === shortForm
  );
  
  return matchedShortForm || branchName;
};

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
              <p>Welcome back, {loggedInStudent?.rollNo || "Student"}</p>
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
                {ACADEMIC_YEARS.map((year, index) => (
                  <option key={index} value={year}>{year}</option>
                ))}
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
                        {['mini-I', 'mini-II', 'major'].map(type => (
                          <div key={type} className={`status-item ${projectStatus[type] ? 'completed' : 'pending'}`}>
                            <div className="status-content">
                              <span className="status-icon">
                                {projectStatus[type] ? '✓' : '○'}
                              </span>
                              <span className="project-type">
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </span>
                            </div>
                            {projectStatus[type] && (
                              <div className="status-actions">
                                <button 
                                  className="small-btn edit-btn"
                                  onClick={() => openEditModal(type)}
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="form-section">
                      <div className="form-section-title">Project Details</div>
                      <div className="form-row-three">
                        <div className="form-group">
                          <label>Project Title *</label>
                          <input
                            type="text"
                            name="projectName"
                            value={formData.projectName}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter project title"
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
                        <label>Abstract *</label>
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
                        <label>Report Link (Google Drive / URL) *</label>
                        <input
                          type="url"
                          name="reportLink"
                          value={formData.reportLink}
                          onChange={handleReportLinkChange}
                          placeholder="https://drive.google.com/your-report-link"
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

          {/* Edit Modal */}
          {showEditModal && (
            <div className="upload-modal-overlay">
              <div className="upload-modal">
                <div className="upload-modal-header">
                  <h2>Edit Project</h2>
                  <button className="close-modal-btn" onClick={closeEditModal}>×</button>
                </div>
                <div className="upload-form">
                  <form onSubmit={handleSaveEdit}>
                    <div className="form-group">
                      <label>Project Title *</label>
                      <input name="projectName" value={editFormData.projectName} onChange={handleEditInputChange} required />
                    </div>
                    <div className="form-group">
                      <label>Domain *</label>
                      <select name="domain" value={editFormData.domain} onChange={handleEditInputChange} required>
                        <option value="">Select Domain</option>
                        {DOMAIN_OPTIONS.map((d, i) => <option key={i} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Abstract *</label>
                      <textarea name="description" value={editFormData.description} onChange={handleEditInputChange} rows="4" required />
                    </div>
                    <div className="form-group">
                      <label>GitHub Link (Optional)</label>
                      <input name="githubLink" value={editFormData.githubLink} onChange={handleEditInputChange} />
                    </div>
                    <div className="form-group">
                      <label>Published Link (Optional)</label>
                      <input name="publishedLink" value={editFormData.publishedLink} onChange={handleEditInputChange} />
                    </div>
                    <div className="form-group">
                      <label>Report Link</label>
                      <input name="reportLink" value={editFormData.reportLink} onChange={handleEditInputChange} />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="submit-btn">Save</button>
                      <button type="button" className="clear-btn" onClick={handleClearProject}>Clear</button>
                      <button type="button" className="cancel-btn" onClick={closeEditModal}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Project Details Modal - MOVED INSIDE THE RETURN */}
          {showProjectModal && selectedProject && (
            <div className="project-modal-overlay">
              <div className="project-modal">
                <div className="project-modal-header">
                  <h3>{selectedProject.projectName}</h3>
                  <button 
                    className="close-modal-btn"
                    onClick={closeProjectModal}
                  >
                    ×
                  </button>
                </div>
                <div className="project-modal-content">
                  <div className="project-details-grid">
                    <div className="detail-item">
                      <label>Project Type:</label>
                      <span className={`badge ${selectedProject.projectType}`}>
                        {selectedProject.projectType.toUpperCase()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Domain:</label>
                      <span>{selectedProject.domain}</span>
                    </div>
                    <div className="detail-item">
                      <label>Academic Year:</label>
                      <span>{selectedProject.academicYear}</span>
                    </div>
                    <div className="detail-item">
                      <label>Branch:</label>
                      <span>{selectedProject.branchShort || BRANCH_SHORT_FORMS[selectedProject.branch] || selectedProject.branch}</span>
                    </div>
                    <div className="detail-item full-width">
                      <label>Student Information:</label>
                      <div className="student-details">
                        <strong>{selectedProject.studentName}</strong>
                        <div className="email">{selectedProject.email}</div>
                        <div className="rollno">{selectedProject.rollNo}</div>
                      </div>
                    </div>
                    <div className="detail-item full-width">
                      <label>Abstract:</label>
                      <div className="project-description">
                        {selectedProject.description}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="project-modal-footer">
                  <button 
                    className="close-btn"
                    onClick={closeProjectModal}
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
                <p>No projects found!</p>
              </div>
            ) : (
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Project Title</th>
                    <th>Links</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project._id} className="table-row">
                      <td className="project-name-cell">
                        <div 
                          className="project-name-content clickable"
                          onClick={() => handleProjectNameClick(project)}
                        >
                          <strong>{project.projectName}</strong>
                          <div className="project-brief-info">
                            <span className={`badge ${project.projectType}`}>
                              {project.projectType.toUpperCase()}
                            </span>
                            <span className="project-domain">{project.domain}</span>
                          </div>
                        </div>
                      </td>
                      <td className="links-cell">
                        <div className="links-container">
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
                        {project.reportLink ? (
                          <a
                            className="link-btn view-report"
                            href={project.reportLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View Report"
                          >
                            View Report
                          </a>
                        ) : (
                          <span className="no-link">No Report</span>
                        )}
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



