// import mongoose from "mongoose";

// const facultySchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true }
// }, { collection: "faculties" });

// export default mongoose.model("Faculty", facultySchema);



// models/Faculty.js
import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { collection: "faculties" });

export default mongoose.model("Faculty", facultySchema);
