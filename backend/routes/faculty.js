import express from "express";
import jwt from "jsonwebtoken";
import { isDummyStudentAccessGranted, toggleAccess } from '../state/accessState.js';

const router = express.Router();

// --- Hardcoded Default Faculty Details ---
const defaultFaculty = {
  _id: 'facultyDefaultId01',
  email: 'amjamaithili@gmail.com',
  password: '12345'
};

// Route for Faculty Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (email !== defaultFaculty.email || password !== defaultFaculty.password) {
    return res.status(401).json({ message: "Invalid faculty credentials" });
  }

  const token = jwt.sign({ id: defaultFaculty._id, role: 'faculty' }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.status(200).json({ message: "Faculty login successful", token });
});

// GET route to check the dummy student's current access status
router.get("/dummy-student/status", (req, res) => {
  res.json({ isAccessGranted: isDummyStudentAccessGranted });
});

// PUT route to toggle the dummy student's access
router.put("/dummy-student/toggle-access", (req, res) => {
  const newStatus = toggleAccess();
  res.json({ message: 'Access updated successfully', isAccessGranted: newStatus });
});

export default router;

