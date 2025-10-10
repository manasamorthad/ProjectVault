import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  projectType: { type: String, enum: ['mini', 'major'], required: true },
  description: { type: String, required: true },
  techStack: { type: [String], required: true },
  studentName: { type: String, required: true },
  email: { type: String, required: true },
  reportFile: { type: String, required: true }, // Stores the filename
  uploadDate: { type: Date, default: Date.now }
}, { collection: "projects" });

export default mongoose.model("Project", projectSchema);