import express from 'express';
import User from '../models/User.js';
import Faculty from '../models/Faculty.js';
import multer from 'multer';
import xlsx from 'xlsx';
import fs from 'fs';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// Upload students from CSV
router.post('/upload-students', upload.single('studentsFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CSV file is required' });
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
        if (!row.rollNo) {
          throw new Error('Roll number is required');
        }

        // Check if student already exists
        const existingStudent = await User.findOne({ roll: row.rollNo });
        if (existingStudent) {
          throw new Error('Student already exists');
        }

        // Create student with default password
        const newStudent = new User({
          roll: row.rollNo,
          password: row.rollNo + 'P', // Default password: rollNo + "P"
          isAccessGranted: false // Access disabled by default
        });

        await newStudent.save();
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: row.rollNo || 'Unknown',
          error: error.message
        });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: `Students upload completed: ${results.successful} successful, ${results.failed} failed`,
      details: results
    });

  } catch (error) {
    console.error('Error in students upload:', error);
    res.status(500).json({ message: 'Server error during students upload' });
  }
});

// Upload faculty from CSV
router.post('/upload-faculty', upload.single('facultyFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CSV file is required' });
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
        if (!row.email) {
          throw new Error('Email is required');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email)) {
          throw new Error('Invalid email format');
        }

        // Check if faculty already exists
        const existingFaculty = await Faculty.findOne({ email: row.email });
        if (existingFaculty) {
          throw new Error('Faculty already exists');
        }

        // Create faculty with default password
        const newFaculty = new Faculty({
          email: row.email,
          password: 'cbit123' // Default password
        });

        await newFaculty.save();
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: row.email || 'Unknown',
          error: error.message
        });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: `Faculty upload completed: ${results.successful} successful, ${results.failed} failed`,
      details: results
    });

  } catch (error) {
    console.error('Error in faculty upload:', error);
    res.status(500).json({ message: 'Server error during faculty upload' });
  }
});

export default router;