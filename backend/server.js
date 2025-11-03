import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import xlsx from 'xlsx';
import fs from 'fs';

<<<<<<< Updated upstream
// Load environment variables FIRST
dotenv.config();

// DEBUG: Check if environment variables are loaded
console.log('=== ENV VARIABLES LOADED ===');
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Loaded' : '❌ Missing');
console.log('SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL);
console.log('================================');

// Now import your routes AFTER environment variables are loaded
import loginRoutes from "./routes/login.js";
import projectRoutes from "./routes/projects.js";
import facultyRoutes from "./routes/faculty.js";
import adminRoutes from './routes/admin.js';
import forgotPasswordRoutes from "./routes/forgot-password.js";
import facultyAuthRoutes from "./routes/facultyAuthRoutes.js";
=======
// Route imports
import loginRoutes from "./routes/login.js";
import projectRoutes from "./routes/projects.js";
import facultyRoutes from "./routes/faculty.js";
>>>>>>> Stashed changes

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

<<<<<<< Updated upstream
// API Routes with debug logging
console.log('=== REGISTERING ROUTES ===');
app.use("/api", loginRoutes);
console.log('✅ Login routes registered');

app.use("/api/faculty", facultyRoutes);
console.log('✅ Faculty routes registered');

app.use("/api/projects", projectRoutes);
console.log('✅ Project routes registered');

app.use('/api/admin', adminRoutes);
console.log('✅ Admin routes registered');
app.use("/api/faculty/auth", facultyAuthRoutes);
console.log('✅ Faculty authentication routes registered');
app.use("/api", forgotPasswordRoutes);
console.log('✅ Forgot password routes registered');
console.log('================================');

// Add a test route to verify server is working
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
=======
// --- Admin Router ---
const adminRouter = express.Router();
const upload = multer({ dest: 'uploads/' });

const ADMIN_USER = {
  email: 'xyz@gmail.com',
  password: '12345',
  id: 'admin01'
};

// Admin login
adminRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
    const token = jwt.sign(
      { id: ADMIN_USER.id, email: ADMIN_USER.email, role: 'admin' },
      process.env.JWT_SECRET || 'a_secure_fallback_secret_key',
      { expiresIn: "1h" }
    );
    return res.status(200).json({ message: "Admin login successful", token });
  }
  return res.status(401).json({ message: "Invalid admin credentials" });
});

// Excel Upload Route
adminRouter.post('/projects/upload-excel', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const filePath = path.resolve(req.file.path);
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const project of data) {
      try {
        // Save to DB (optional)
        // await Project.create(project);
        successCount++;
      } catch (err) {
        errorCount++;
        errors.push({ rollNo: project.rollNo, error: err.message });
      }
    }

    fs.unlinkSync(filePath);

    res.json({
      message: 'Excel file processed successfully',
      successCount,
      errorCount,
      errors
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing file' });
  }
});

// Register Routes
app.use("/api", loginRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/admin", adminRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
>>>>>>> Stashed changes
