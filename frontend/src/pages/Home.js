import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import "./Home.css";

const API_URL = 'http://localhost:5000/api';

function Home() {
  const [projects, setProjects] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    projectName: '',
    projectType: 'mini',
    description: '',
    techStack: '',
    studentName: '',
    email: '',
    reportFile: null,
  });

  // ✅ Memoize fetchProjects to keep stable reference
  const fetchProjects = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`, {
        params: { type: filterType, search: searchTerm },
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      alert('Failed to fetch projects');
    }
  }, [filterType, searchTerm]);

  // ✅ Effect now safely depends on fetchProjects
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

    const data = new FormData();
    data.append('projectName', formData.projectName);
    data.append('projectType', formData.projectType);
    data.append('description', formData.description);
    data.append('techStack', JSON.stringify(formData.techStack.split(',').map(t => t.trim())));
    data.append('studentName', formData.studentName);
    data.append('email', formData.email);
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
      const response = await axios.get(`${API_URL}/download/${filename}`, {
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

  return (
    <div className="App">
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

            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {showUploadForm && (
          <div className="upload-form">
            <h2>Upload New Project</h2>
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
                  {project.techStack.map((tech, index) => (
                    <span key={index} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="project-footer">
                  <div className="student-info">
                    <p><strong>👤 {project.studentName}</strong></p>
                    <p className="email">✉ {project.email}</p>
                    <p className="date">
                      📅 {new Date(project.uploadDate).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    className="download-btn"
                    onClick={() => handleDownload(project.reportFile, project.projectName)}
                  >
                    📥 Download Report
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;