import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
<<<<<<< Updated upstream
  projectType: { 
    type: String, 
    enum: ['mini-I', 'mini-II', 'major'], 
    required: true 
  },
=======
  // Updated projectType to be more specific
  projectType: { type: String, enum: ['mini-I', 'mini-II', 'major'], required: true },
>>>>>>> Stashed changes
  description: { type: String, required: true },
  domain: { type: String, required: true },
  studentName: { type: String, required: true },
  email: { type: String, required: true },
  rollNo: { type: String, required: true },
  branch: { type: String, required: true },
  academicYear: { type: String, required: true },
  githubLink: { type: String, default: '' },
<<<<<<< Updated upstream
  publishedLink: { type: String, default: '' },
  reportFile: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  uploadedByAdmin: { type: Boolean, default: false } // Track if uploaded by admin
}, { collection: "projects_collection" });

projectSchema.index({ rollNo: 1, projectType: 1 }, { unique: true });
=======
  publishedLink: String,
  reportFile: String, // Path to downloaded PDF
  uploadDate: { type: Date, default: Date.now }
}, { collection: "projects" });
>>>>>>> Stashed changes

export default mongoose.model("Project", projectSchema);