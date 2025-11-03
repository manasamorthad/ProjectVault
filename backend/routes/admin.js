import express from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Helper function to clean CSV keys (remove BOM and whitespace)
const cleanKey = (key) => {
  return key.replace(/^\uFEFF/, '').trim();
};

// ========================================================
// 🔹 Upload Students via CSV
// ========================================================
router.post("/upload-students", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const results = [];
    const errors = [];
    let successful = 0;
    let failed = 0;

    // Read and parse CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv({
        mapHeaders: ({ header }) => cleanKey(header),
        skipEmptyLines: true
      }))
      .on("data", (data) => {
        // Clean all keys in the data object
        const cleanedData = {};
        Object.keys(data).forEach(key => {
          cleanedData[cleanKey(key)] = data[key] ? data[key].trim() : '';
        });
        results.push(cleanedData);
      })
      .on("end", async () => {
        console.log("📊 Parsed students data:", results);

        // Process each student
        for (let i = 0; i < results.length; i++) {
          const row = results[i];
          const rowNumber = i + 2; // +2 because index starts at 0 and row 1 is header

          try {
            const rollNo = row.rollNo || row.RollNo || row.rollno || row.ROLLNO;
            const email = row.email || row.Email || row.EMAIL;

            console.log(`Processing Row ${rowNumber}:`, { rollNo, email });

            // Validate required fields
            if (!rollNo || !email) {
              errors.push({
                row: `Row ${rowNumber}`,
                error: `Missing ${!rollNo ? 'rollNo' : 'email'}`,
                data: row
              });
              failed++;
              continue;
            }

            // Check if student already exists
            const existingStudent = await Student.findOne({ rollNo: rollNo.trim().toUpperCase() });
            if (existingStudent) {
              errors.push({
                row: `Row ${rowNumber} (${rollNo})`,
                error: "Student already exists"
              });
              failed++;
              continue;
            }

            // Create default password: rollNo + "P"
            const defaultPassword = rollNo.trim() + "P";

            // Create new student
            const newStudent = new Student({
              rollNo: rollNo.trim().toUpperCase(),
              email: email.trim().toLowerCase(),
              password: defaultPassword,
              accessEnabled: false // Disabled by default
            });

            await newStudent.save();
            console.log(`✅ Student created: ${rollNo}`);
            successful++;

          } catch (error) {
            console.error(`❌ Error on row ${rowNumber}:`, error);
            errors.push({
              row: `Row ${rowNumber}`,
              error: error.message
            });
            failed++;
          }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Send response
        res.status(200).json({
          message: "Student upload completed",
          details: {
            successful,
            failed,
            total: results.length,
            errors: errors.length > 0 ? errors : undefined
          }
        });
      })
      .on("error", (error) => {
        console.error("❌ CSV parsing error:", error);
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: "Error parsing CSV file: " + error.message });
      });

  } catch (error) {
    console.error("❌ Error uploading students:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Server error during student upload: " + error.message });
  }
});

// ========================================================
// 🔹 Upload Faculty via CSV
// ========================================================
router.post("/upload-faculty", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const results = [];
    const errors = [];
    let successful = 0;
    let failed = 0;

    // Read and parse CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv({
        mapHeaders: ({ header }) => cleanKey(header),
        skipEmptyLines: true
      }))
      .on("data", (data) => {
        // Clean all keys in the data object
        const cleanedData = {};
        Object.keys(data).forEach(key => {
          cleanedData[cleanKey(key)] = data[key] ? data[key].trim() : '';
        });
        results.push(cleanedData);
      })
      .on("end", async () => {
        console.log("📊 Parsed faculty data:", results);

        // Process each faculty
        for (let i = 0; i < results.length; i++) {
          const row = results[i];
          const rowNumber = i + 2;

          try {
            const email = row.email || row.Email || row.EMAIL;

            console.log(`Processing Row ${rowNumber}:`, { email });

            // Validate required fields
            if (!email) {
              errors.push({
                row: `Row ${rowNumber}`,
                error: "Missing email",
                data: row
              });
              failed++;
              continue;
            }

            // Check if faculty already exists
            const existingFaculty = await Faculty.findOne({ email: email.trim().toLowerCase() });
            if (existingFaculty) {
              errors.push({
                row: `Row ${rowNumber} (${email})`,
                error: "Faculty already exists"
              });
              failed++;
              continue;
            }

            // Create new faculty with default password
            const newFaculty = new Faculty({
              email: email.trim().toLowerCase(),
              password: "cbit123", // Will be hashed by pre-save hook
              isAdmin: false,
              role: "faculty"
            });

            await newFaculty.save();
            console.log(`✅ Faculty created: ${email}`);
            successful++;

          } catch (error) {
            console.error(`❌ Error on row ${rowNumber}:`, error);
            errors.push({
              row: `Row ${rowNumber}`,
              error: error.message
            });
            failed++;
          }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Send response
        res.status(200).json({
          message: "Faculty upload completed",
          details: {
            successful,
            failed,
            total: results.length,
            errors: errors.length > 0 ? errors : undefined
          }
        });
      })
      .on("error", (error) => {
        console.error("❌ CSV parsing error:", error);
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: "Error parsing CSV file: " + error.message });
      });

  } catch (error) {
    console.error("❌ Error uploading faculty:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Server error during faculty upload: " + error.message });
  }
});

export default router;