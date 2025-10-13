import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  projectType: { type: String, enum: ['mini', 'major'], required: true },
  description: { type: String, required: true },
  domain: { type: String, required: true }, // New domain field
  studentName: { type: String, required: true },
  email: { type: String, required: true },
  rollNo: { type: String, required: true },
  branch: { type: String, required: true }, 
  academicYear: { type: String, required: true }, 
  githubLink: { type: String, default: '' },
  reportFile: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now }
}, { collection: "projects" });
export default mongoose.model("Project", projectSchema);