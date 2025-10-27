import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { isDummyStudentAccessGranted } from '../state/accessState.js';
import User from "../models/User.js";

const router = express.Router();

// --- Hardcoded Dummy Student Details ---
const DUMMY_STUDENT = {
  roll: '160123737141',
  password: '160123737141P'
};

router.post("/login", async (req, res) => {
  const { roll, password } = req.body;

  // Special handling for the dummy student
  if (roll === DUMMY_STUDENT.roll) {
    if (password !== DUMMY_STUDENT.password) {
      return res.status(401).json({ message: "Incorrect password for dummy student" });
    }

    const token = jwt.sign({ roll: DUMMY_STUDENT.roll }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    return res.status(200).json({
      message: "Login successful",
      token,
      isAccessGranted: isDummyStudentAccessGranted,
      studentRollNo: DUMMY_STUDENT.roll
    });
  }

  // Find user in database
  const user = await User.findOne({ roll });
  if (!user) return res.status(404).json({ message: "Roll not found" });

  // ✅ FIXED: Check if password exists before checking if it's hashed
  if (!user.password) {
    return res.status(401).json({ message: "No password set for this account" });
  }

  // ✅ FIXED: Safe password type detection
  const isPasswordHashed = user.password && 
                          (user.password.startsWith('$2a$') || 
                           user.password.startsWith('$2b$') || 
                           user.password.startsWith('$2y$'));

  let isPasswordValid = false;

  if (isPasswordHashed) {
    // Compare with bcrypt for reset passwords
    isPasswordValid = await bcrypt.compare(password, user.password);
  } else {
    // Direct comparison for admin-created plain text passwords
    isPasswordValid = (password === user.password);
  }

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  const token = jwt.sign({ roll: user.roll }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.status(200).json({ 
    message: "Login successful", 
    token, 
    isAccessGranted: true, 
    studentRollNo: user.roll 
  });
});

export default router;