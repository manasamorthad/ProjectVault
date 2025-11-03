import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  projectType: { type: String, required: true },
  description: { type: String, required: true },
  domain: { type: String, required: true },
  studentName: { type: String, required: true },
  email: { type: String, required: true },
  rollNo: { type: String, required: true },
  branch: { type: String, required: true },
  academicYear: { type: String, required: true },
  githubLink: { type: String, default: '' },
  publishedLink: { type: String, default: '' },
  reportLink: {
    type: String,
    required: true
  },
  uploadedByAdmin: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);