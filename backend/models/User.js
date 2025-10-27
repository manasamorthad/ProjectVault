import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  roll: String,
  password: String, // Stored as plain text for admin-created users
  email: {
    type: String,
    required: true
  },
  isAccessGranted: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { collection: "users" });

export default mongoose.model("User", userSchema);