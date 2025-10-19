import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

import loginRoutes from "./routes/login.js";
import projectRoutes from "./routes/projects.js";
import facultyRoutes from "./routes/faculty.js"; // Import faculty routes
import adminRoutes from './routes/admin.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// API Routes
app.use("/api", loginRoutes);
app.use("/api/faculty", facultyRoutes); // Use faculty routes
app.use("/api/projects", projectRoutes);
app.use('/api/admin', adminRoutes);
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

