import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import Faculty from "../models/Faculty.js";
import { sendResetEmail } from "../utils/emailService.js";

const router = express.Router();

/**
 * 🔹 Route: POST /api/faculty/auth/forgot-password
 * 🔹 Description: Sends password reset email to faculty if email exists
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("🔔 Faculty forgot password request for:", email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find faculty by email
    const faculty = await Faculty.findOne({ email });

    if (!faculty) {
      return res.status(404).json({ message: "No faculty found with this email" });
    }

    // Generate reset token and expiration
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = Date.now() + 3600000; // 1 hour

    faculty.resetPasswordToken = resetToken;
    faculty.resetPasswordExpires = resetPasswordExpires;
    await faculty.save();

    console.log(`📧 Sending faculty reset email to: ${faculty.email}`);

    // Send password reset email
    await sendResetEmail(faculty.email, resetToken, faculty.email, "faculty");

    res.json({
      message: "Password reset email sent successfully to the registered faculty email.",
      emailSent: true,
    });

  } catch (error) {
    console.error("❌ Faculty forgot password error:", error);
    res.status(500).json({
      message: error.message || "Server error. Please try again later.",
    });
  }
});

/**
 * 🔹 Route: POST /api/faculty/auth/reset-password
 * 🔹 Description: Resets faculty password using valid token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    console.log("🔔 Faculty reset password request received");
    console.log("Token:", token ? "Present" : "Missing");
    console.log("New Password:", newPassword ? "Present" : "Missing");

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Missing token or new password" });
    }

    // Find faculty by reset token and check expiry
    const faculty = await Faculty.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!faculty) {
      console.log("❌ Invalid or expired token");
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    console.log("✅ Valid token found for faculty:", faculty.email);

    // Hash new password and clear reset fields
        faculty.password = newPassword;
    faculty.resetPasswordToken = undefined;
    faculty.resetPasswordExpires = undefined;
    await faculty.save();

    console.log("✅ Password reset successfully for:", faculty.email);

    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;