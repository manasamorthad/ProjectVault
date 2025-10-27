import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendResetEmail } from "../utils/emailService.js";

const router = express.Router();

// Forgot Password Route (existing code)
router.post("/forgot-password", async (req, res) => {
  try {
    const { roll } = req.body;
    
    console.log("🔔 Forgot password request for roll:", roll);
    
    if (!roll) {
      return res.status(400).json({ message: "Roll number is required" });
    }

    // Find user by roll number
    const user = await User.findOne({ roll });
    
    if (!user) {
      return res.status(404).json({ message: "User not found with this roll number" });
    }

    if (!user.email) {
      return res.status(400).json({ message: "No email registered for this account" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = Date.now() + 3600000; // 1 hour

    // Save token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    console.log(`📧 Sending reset email to: ${user.email}`);

    // Send email via SendGrid
    await sendResetEmail(user.email, resetToken, user.roll);

    res.json({ 
      message: "Password reset email sent successfully to your college email",
      emailSent: true
    });

  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({ 
      message: error.message || "Server error. Please try again later." 
    });
  }
});


router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    console.log("🔄 Reset password request received");
    console.log("📋 Token:", token ? "Present" : "Missing");
    console.log("📋 Password length:", newPassword?.length || 0);
    
    if (!token || !newPassword) {
      return res.status(400).json({ 
        message: "Reset token and new password are required" 
      });
    }

    // Find user by reset token and check expiration
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    console.log("👤 User found:", user ? `Yes (${user.roll})` : "No");
    
    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired reset token. Please request a new password reset." 
      });
    }

    // Hash the new password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user's password with hashed version
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    console.log(`✅ Password reset successful for user: ${user.roll}`);

    res.json({ 
      message: "Password reset successfully! You can now login with your new password.",
      success: true
    });

  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({ 
      message: error.message || "Server error during password reset. Please try again." 
    });
  }
});

export default router;