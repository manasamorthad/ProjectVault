import express from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; // <-- Use User model instead of Student

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
            const roll = row.roll || row.rollNo || row.RollNo || row.ROLLNO;
            const email = row.email || row.Email || row.EMAIL;

            console.log(`Processing Row ${rowNumber}:`, { roll, email });

            // Validate required fields
            if (!roll || !email) {
              errors.push({
                row: `Row ${rowNumber}`,
                error: `Missing ${!roll ? 'roll' : 'email'}`,
                data: row
              });
              failed++;
              continue;
            }

            // Check if user already exists
            const existingUser = await User.findOne({ roll: roll.trim() });
            if (existingUser) {
              errors.push({
                row: `Row ${rowNumber} (${roll})`,
                error: "User already exists"
              });
              failed++;
              continue;
            }

            // Create default password: roll + "P"
            const defaultPassword = roll.trim() + "P";
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);

            // Create new user
            const newUser = new User({
              roll: roll.trim(),
              email: email.trim().toLowerCase(),
              password: hashedPassword,
              isAccessGranted: false // Disabled by default
            });

            await newUser.save();
            console.log(`✅ User created: ${roll}`);
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
          message: "User upload completed",
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
    res.status(500).json({ message: "Server error during user upload: " + error.message });
  }
});

export default router;