import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";       // ✅ Added this
import Faculty from "../models/Faculty.js";  // ✅ Added this
const router = express.Router();



// Store department access in memory
let departmentAccess = {
  'IT': true, // B.E- INFORMATION TECHNOLOGY
  'CSE': true,
  'CIVIL': true,
  'EEE': true,
  'ECE': true,
  'MECH': true,
  'PROD': true,
  'CHEM': true,
  'BIO-TECH': true,
  'AIDS': true,
  'IOT-CS': true,
  'AIML': true
};

const verifyFaculty = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.faculty = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};


// ========================================================
// 🔹 Faculty Login (with database)
// ========================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    // 1️⃣ Check if faculty exists
    const faculty = await Faculty.findOne({ email });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    // 2️⃣ Compare hashed password
    const isMatch = await bcrypt.compare(password, faculty.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 3️⃣ Generate JWT
    const token = jwt.sign(
      { id: faculty._id, role: "faculty" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Faculty login successful",
      token,
      faculty: {
        id: faculty._id,
        email: faculty.email,
      },
    });
  } catch (error) {
    console.error("❌ Faculty login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});
// Get all department access status (protected)
router.get('/department-access', verifyFaculty, (req, res) => {
  res.json(departmentAccess);
});

// Toggle access for a specific department (protected)
router.put('/department-access/:department', verifyFaculty, (req, res) => {
  const { department } = req.params;
  
  if (departmentAccess.hasOwnProperty(department)) {
    departmentAccess[department] = !departmentAccess[department];
    res.json({ 
      department, 
      accessGranted: departmentAccess[department],
      message: `${department} department access ${departmentAccess[department] ? 'granted' : 'revoked'}`
    });
  } else {
    res.status(400).json({ message: 'Invalid department' });
  }
});
// Check if a student has view access based on their branch (public)
router.get('/student-view-access/:rollNo', async (req, res) => {
  try {
    const { rollNo } = req.params;
    
    // Extract branch from roll number
    const branchCode = rollNo.substring(6, 9);
    const PROGRAMME_CODES = {
      '732': 'CIVIL',
      '733': 'CSE',
      '734': 'EEE',
      '735': 'ECE',
      '736': 'MECH',
      '737': 'IT',
      '738': 'PROD',
      '802': 'CHEM',
      '805': 'BIO-TECH',
      '771': 'AIDS',
      '749': 'IOT-CS',
      '729': 'AIML'
    };
    
    const studentBranch = PROGRAMME_CODES[branchCode];
    
    if (studentBranch && departmentAccess[studentBranch]) {
      res.json({ hasViewAccess: true, branch: studentBranch });
    } else {
      res.json({ hasViewAccess: false, branch: studentBranch });
    }
  } catch (error) {
    console.error('Error checking student access:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;