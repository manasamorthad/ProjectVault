import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import Project from '../models/Project.js';

const router = express.Router();
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.originalname}`;
    cb(null, unique);
  }
});
const upload = multer({ storage });

// Use memory storage for parsing form fields only
const uploadFields = multer().none();

// List projects with optional filters
router.get('/', async (req, res) => {
  try {
    const { type, search, branch, domain } = req.query;
    const filter = {};
    if (type) filter.projectType = type;
    if (branch) filter.branch = branch;
    if (domain) filter.domain = domain;
    if (search) filter.$or = [
      { projectName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { studentName: { $regex: search, $options: 'i' } }
    ];

    const projects = await Project.find(filter).sort({ createdAt: -1 }).lean();
    res.json(projects);
  } catch (err) {
    console.error('Error listing projects:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project - accepts reportLink (form field) or file upload 'reportFile'
router.post('/', uploadFields, async (req, res) => {
  try {
    // Log the incoming request body for debugging
    console.log('Project upload request body:', req.body);

    // Required fields
    const requiredFields = [
      'projectName',
      'projectType',
      'description',
      'domain',
      'studentName',
      'email',
      'rollNo',
      'branch',
      'academicYear',
      'reportLink'
    ];

    // Check for missing fields
    const missing = requiredFields.filter(field => !req.body[field]);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` });
    }

    // Create new project
    const project = new Project({
      projectName: req.body.projectName,
      projectType: req.body.projectType,
      description: req.body.description,
      domain: req.body.domain,
      studentName: req.body.studentName,
      email: req.body.email,
      rollNo: req.body.rollNo,
      branch: req.body.branch,
      academicYear: req.body.academicYear,
      githubLink: req.body.githubLink,
      publishedLink: req.body.publishedLink,
      reportLink: req.body.reportLink
    });

    await project.save();
    res.status(201).json({ message: "Project uploaded successfully", project });
  } catch (error) {
    console.error('Project upload error:', error, req.body);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update project (PUT)
router.put('/:id', async (req, res) => {
  try {
    const allowedUpdates = [
      'projectName',
      'description',
      'domain',
      'githubLink',
      'publishedLink',
      'reportLink'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update the project
    Object.assign(project, updates);
    await project.save();
    
    res.json({ message: 'Project updated', project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

// Also accept alternate delete paths to avoid 404s from frontend retries
router.delete('/delete/:id', (req, res) => router.handle(req, res));
router.delete('/remove/:id', (req, res) => router.handle(req, res));

// Download stored file (only for files stored on server)
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    if (!filename) return res.status(400).send('Filename required');
    // if filename looks like URL -> redirect
    if (filename.startsWith('http')) return res.redirect(filename);

    const filePath = path.join(uploadsDir, filename);
    if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
    res.download(filePath);
  } catch (err) {
    console.error('Error downloading file:', err);
    res.status(500).send('Server error');
  }
});

// Get project status for a student
router.get('/student-status/:rollNo', async (req, res) => {
  try {
    const rollNo = req.params.rollNo;
    if (!rollNo) {
      return res.status(400).json({ message: 'Roll number is required' });
    }

    // Find all projects for this student
    const projects = await Project.find({ rollNo });
    
    // Initialize status object
    const status = {
      'mini-I': false,
      'mini-II': false,
      'major': false
    };

    // Update status based on found projects
    projects.forEach(project => {
      if (project.projectType && status.hasOwnProperty(project.projectType)) {
        status[project.projectType] = true;
      }
    });

    res.json(status);
  } catch (error) {
    console.error('Error fetching student project status:', error);
    res.status(500).json({ message: 'Error fetching project status' });
  }
});

export default router;