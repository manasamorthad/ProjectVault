import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { collection: "faculties" });

export default mongoose.model("Faculty", facultySchema);
