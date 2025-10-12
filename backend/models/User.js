import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  roll: String,
  password: String,
  isAccessGranted: {
    type: Boolean,
    default: false // Students will not have access by default
  }
}, { collection: "users" });

export default mongoose.model("User", userSchema);