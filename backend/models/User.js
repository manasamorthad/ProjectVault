import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  roll: String,
  password: String
}, { collection: "users" });

export default mongoose.model("User", userSchema);