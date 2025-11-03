import express from 'express';
import Project from '../models/Project.js';
import multer from 'multer';
import path from 'path';
import xlsx from 'xlsx';
import fs from 'fs';

const router = express.Router();

// Multer configuration for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
<<<<<<< Updated upstream
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Excel files are allowed'), false);
    }
  }
});

// Check student project status
router.get('/student-status/:rollNo', async (req, res) => {
  try {
    const { rollNo } = req.params;
    
    const projects = await Project.find({ rollNo });
    
    const status = {
      'mini-I': false,
      'mini-II': false,
      'major': false
    };
    
    projects.forEach(project => {
      status[project.projectType] = true;
    });
    
    res.json(status);
  } catch (error) {
    console.error('Error fetching student status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects - Upload new project
router.post('/', upload.single('reportFile'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const { 
      projectName, 
      projectType, 
      description, 
      domain,
      studentName, 
      email,
      rollNo,
      branch,
      academicYear,
      githubLink,
      publishedLink
=======
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  }
});

// POST /api/projects - Upload new project
router.post('/', upload.single('reportFile'), async (req, res) => {
  try {
    let { 
      projectName, projectType, description, domain, studentName, 
      email, rollNo, branch, academicYear, githubLink, publishedLink
>>>>>>> Stashed changes
    } = req.body;

    // Map frontend 'mini' values to backend enum
    if (projectType === 'mini') projectType = 'mini-I';
    if (projectType === 'mini-II') projectType = 'mini-II';
    if (projectType === 'major') projectType = 'major';

    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

<<<<<<< Updated upstream
    // Check if student already uploaded this project type
    const existingProject = await Project.findOne({ 
      rollNo, 
      projectType 
    });

    if (existingProject) {
      return res.status(400).json({ 
        message: `You have already uploaded a ${projectType} project` 
      });
=======
    // Validate required fields
    if (!projectName || !projectType || !description || !domain || !studentName || !email || !rollNo || !branch || !academicYear) {
      return res.status(400).json({ message: 'All required fields must be filled' });
>>>>>>> Stashed changes
    }

    const newProject = new Project({
      projectName,
      projectType,
      description,
      domain,
      studentName,
      email,
      rollNo,
      branch,
      academicYear,
      githubLink: githubLink || '',
      publishedLink: publishedLink || '',
<<<<<<< Updated upstream
      reportFile: req.file.filename,
      uploadedByAdmin: req.body.uploadedByAdmin === 'true'
=======
      reportFile: req.file.filename
>>>>>>> Stashed changes
    });

    await newProject.save();
    res.status(201).json({ message: 'Project uploaded successfully' });
  } catch (error) {
    console.error('Error uploading project:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'This project type has already been uploaded for this student' 
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk upload from Excel
router.post('/bulk-upload', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Excel file is required' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const row of data) {
      try {
        // Validate required fields
        const requiredFields = [
          'projectName', 'projectType', 'description', 'domain',
          'studentName', 'email', 'rollNo', 'branch', 'academicYear'
        ];

        const missingFields = requiredFields.filter(field => !row[field]);
        if (missingFields.length > 0) {
          throw new Error(`Missing fields: ${missingFields.join(', ')}`);
        }

        // Validate project type
        if (!['mini-I', 'mini-II', 'major'].includes(row.projectType)) {
          throw new Error('Invalid project type');
        }

        // Check if project already exists
        const existingProject = await Project.findOne({
          rollNo: row.rollNo,
          projectType: row.projectType
        });

        if (existingProject) {
          throw new Error('Project type already exists for this student');
        }

        // For bulk upload, we'll use Google Drive links
        if (!row.reportFile) {
          throw new Error('Report file link is required');
        }

        const newProject = new Project({
          projectName: row.projectName,
          projectType: row.projectType,
          description: row.description,
          domain: row.domain,
          studentName: row.studentName,
          email: row.email,
          rollNo: row.rollNo,
          branch: row.branch,
          academicYear: row.academicYear,
          githubLink: row.githubLink || '',
          publishedLink: row.publishedLink || '',
          reportFile: row.reportFile, // Google Drive link
          uploadedByAdmin: true
        });

        await newProject.save();
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: row.studentName || 'Unknown',
          error: error.message
        });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: `Bulk upload completed: ${results.successful} successful, ${results.failed} failed`,
      details: results
    });

  } catch (error) {
    console.error('Error in bulk upload:', error);
    res.status(500).json({ message: 'Server error during bulk upload' });
  }
});

// GET /api/projects - Get all projects with filtering
router.get('/', async (req, res) => {
  try {
    const { type, search, academicYear, branch, domain, sort } = req.query;
    
    let filter = {};
    if (type && type !== 'all') filter.projectType = type;
    if (academicYear && academicYear !== 'all') filter.academicYear = academicYear;
    if (domain && domain !== 'all') filter.domain = domain;
    
    if (branch && branch !== 'all') {
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
      filter.branch = branchMapping[branch] || branch;
    }

    if (search) {
      filter.$or = [
        { projectName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } }
      ];
    }

<<<<<<< Updated upstream
    console.log('Applied filters:', filter);

    // Build sort object
    let sortOption = {};
    if (sort === 'asc') {
      sortOption = { academicYear: 1 };
    } else if (sort === 'desc') {
      sortOption = { academicYear: -1 };
    } else {
      sortOption = { uploadDate: -1 };
    }
=======
    let sortOption = { uploadDate: -1 };
    if (sort === 'asc') sortOption = { academicYear: 1 };
    if (sort === 'desc') sortOption = { academicYear: -1 };
>>>>>>> Stashed changes

    const projects = await Project.find(filter).sort(sortOption);

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

    const projectsWithShortBranches = projects.map(p => ({
      ...p._doc,
      branchShort: shortFormMapping[p.branch] || p.branch
    }));

<<<<<<< Updated upstream
    console.log(`Found ${projectsWithShortBranches.length} projects after filtering`);
    
=======
>>>>>>> Stashed changes
    res.json(projectsWithShortBranches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/projects/status/:rollNo - Check submission status
router.get('/status/:rollNo', async (req, res) => {
  try {
    const { rollNo } = req.params;
    if (!rollNo) return res.status(400).json({ message: 'Roll number is required' });

    const submittedProjects = await Project.find({ rollNo }).select('projectType -_id');
    const submittedTypes = new Set(submittedProjects.map(p => p.projectType));
    const status = {
      'mini-I': submittedTypes.has('mini-I'),
      'mini-II': submittedTypes.has('mini-II'),
      'major': submittedTypes.has('major'),
    };
    res.json(status);
  } catch (error) {
    console.error('Error fetching project status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/projects/download/:filename - Download report
router.get('/download/:filename', (req, res) => {
  try {
<<<<<<< Updated upstream
    const filename = req.params.filename;
    
    // Check if it's a Google Drive link (starts with http)
    if (filename.startsWith('http')) {
      return res.redirect(filename);
    }
    
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    
=======
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', filename);
>>>>>>> Stashed changes
    res.download(filePath, (err) => {
      if (err) res.status(404).json({ message: 'File not found' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
