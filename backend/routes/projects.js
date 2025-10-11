import express from 'express';
import Project from '../models/Project.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// GET /api/projects - Get all projects with filtering
router.get('/', async (req, res) => {
  try {
    const { type, search, academicYear, branch, sort } = req.query;
    
    // Build filter object
    let filter = {};
    
    if (type && type !== 'all') {
      filter.projectType = type;
    }
    
    if (academicYear && academicYear !== 'all') {
      filter.academicYear = academicYear;
    }
    
    if (branch && branch !== 'all') {
      filter.branch = branch;
    }
    
    if (search) {
      filter.$or = [
        { projectName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { techStack: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sortOption = {};
    if (sort === 'year-desc') {
      sortOption = { academicYear: -1 };
    } else if (sort === 'year-asc') {
      sortOption = { academicYear: 1 };
    } else {
      sortOption = { uploadDate: -1 }; // Default sort by upload date
    }

    const projects = await Project.find(filter).sort(sortOption);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects - Upload new project
// POST /api/projects - Upload new project
router.post('/', upload.single('reportFile'), async (req, res) => {
  try {
    console.log('Request body:', req.body); // Add this for debugging
    console.log('Request file:', req.file); // Add this for debugging
    
    const { 
      projectName, 
      projectType, 
      description, 
      techStack, 
      studentName, 
      email,
      rollNo,
      branch,
      academicYear,
      githubLink  // Make sure this is included
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    // Parse techStack from JSON string to array
    let parsedTechStack;
    try {
      parsedTechStack = JSON.parse(techStack);
    } catch (error) {
      parsedTechStack = techStack.split(',').map(item => item.trim());
    }

    const newProject = new Project({
      projectName,
      projectType,
      description,
      techStack: parsedTechStack,
      studentName,
      email,
      rollNo,
      branch,
      academicYear,
      githubLink: githubLink || '', // Make sure this is saved
      reportFile: req.file.filename
    });

    console.log('New project to save:', newProject); // Add this for debugging

    await newProject.save();
    res.status(201).json({ message: 'Project uploaded successfully' });
  } catch (error) {
    console.error('Error uploading project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/download/:filename - Download report file
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(404).json({ message: 'File not found' });
      }
    });
  } catch (error) {
    console.error('Error in download route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;