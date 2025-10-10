import express from "express";
import multer from "multer";
import path from "path";
import Project from "../models/Project.js";

const router = express.Router();

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure you have an 'uploads' directory in your root folder
  },
  filename: function (req, file, cb) {
    // Create a unique filename to prevent overwriting
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// === ROUTES ===

// GET /api/projects - Fetch all projects with filtering and search
router.get("/projects", async (req, res) => {
  try {
    const { type, search } = req.query;
    let query = {};

    // Filter by project type (mini/major)
    if (type && type !== 'all') {
      query.projectType = type;
    }

    // Search by project name (case-insensitive)
    if (search) {
      query.projectName = { $regex: search, $options: 'i' };
    }

    const projects = await Project.find(query).sort({ uploadDate: -1 }); // Sort by most recent
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error: error.message });
  }
});

// POST /api/projects - Upload a new project
router.post("/projects", upload.single('reportFile'), async (req, res) => {
  try {
    const { projectName, projectType, description, techStack, studentName, email } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "Report file is required." });
    }

    const newProject = new Project({
      projectName,
      projectType,
      description,
      techStack: JSON.parse(techStack), // The techStack is stringified in the frontend
      studentName,
      email,
      reportFile: req.file.filename // Save the generated filename
    });

    await newProject.save();
    res.status(201).json({ message: "Project uploaded successfully", project: newProject });
  } catch (error) {
    res.status(500).json({ message: "Error uploading project", error: error.message });
  }
});

// GET /api/download/:filename - Download a project report
router.get("/download/:filename", (req, res) => {
  const { filename } = req.params;

  // Construct the path dynamically and reliably
  const file = path.join(process.cwd(), 'uploads', filename);

  res.download(file, (err) => {
    if (err) {
      console.error("Download Error:", err); // Added for better debugging
      res.status(404).json({ message: "File not found." });
    }
  });
});

export default router;