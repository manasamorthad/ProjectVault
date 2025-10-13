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

// In your projects route file, update the POST and GET endpoints:

// POST /api/projects - Upload new project
router.post('/', upload.single('reportFile'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const { 
      projectName, 
      projectType, 
      description, 
      domain,  // Add domain
      studentName, 
      email,
      rollNo,
      branch,
      academicYear,
      githubLink
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    const newProject = new Project({
      projectName,
      projectType,
      description,
      domain,  // Add domain
      studentName,
      email,
      rollNo,
      branch,
      academicYear,
      githubLink: githubLink || '',
      reportFile: req.file.filename
    });

    console.log('New project to save:', newProject);
    await newProject.save();
    res.status(201).json({ message: 'Project uploaded successfully' });
  } catch (error) {
    console.error('Error uploading project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/projects - Get all projects with filtering
router.get('/', async (req, res) => {
  try {
    const { type, search, academicYear, branch, domain, sort } = req.query;
    
    // Build filter object
    let filter = {};
    
    if (type && type !== 'all') {
      filter.projectType = type;
    }
    
    if (academicYear && academicYear !== 'all') {
      filter.academicYear = academicYear;
    }
    
    if (branch && branch !== 'all') {
      // Map short form branch back to full branch name for filtering
      const branchMapping = {
        'CIVIL': 'B.E- CIVIL ENGINEERING',
        'CSE': 'B.E- COMPUTER SCIENCE AND ENGG.',
        'EEE': 'B.E- ELECTRICAL & ELECTRONICS ENGG.',
        'ECE': 'B.E- ELECTRONICS & COMMUNICATION ENGG.',
        'MECH': 'B.E- MECHANICAL ENGINEERING',
        'IT': 'B.E- INFORMATION TECHNOLOGY',
        'PROD': 'B.E- PRODUCTION ENGINEERING',
        'CHEM': 'B.TECH- CHEMICAL ENGINEERING',
        'BIO-TECH': 'B.TECH- BIO TECHNOLOGY',
        'AIDS': 'B.E- ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
        'IOT-CS': 'B.E- INTERNET OF THINGS AND CYBER SECURITY',
        'AIML': 'B.E- ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING'
      };
      
      // Use the mapping to get the full branch name
      const fullBranchName = branchMapping[branch];
      if (fullBranchName) {
        filter.branch = fullBranchName;
      } else {
        // If no mapping found, use the original value (fallback)
        filter.branch = branch;
      }
    }
    
    if (domain && domain !== 'all') {
      filter.domain = domain;
    }
    
    if (search) {
      filter.$or = [
        { projectName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Applied filters:', filter); // Debug log

    // Build sort object
    let sortOption = {};
    if (sort === 'asc') {
      sortOption = { academicYear: 1 };
    } else if (sort === 'desc') {
      sortOption = { academicYear: -1 };
    } else {
      sortOption = { uploadDate: -1 };
    }

    const projects = await Project.find(filter).sort(sortOption);
    
    // Convert full branch names to short forms in response
    const shortFormMapping = {
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
    
    const projectsWithShortBranches = projects.map(project => ({
      ...project._doc,
      branchShort: shortFormMapping[project.branch] || project.branch
    }));

    console.log(`Found ${projectsWithShortBranches.length} projects after filtering`); // Debug log
    
    res.json(projectsWithShortBranches);
  } catch (error) {
    console.error('Error fetching projects:', error);
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