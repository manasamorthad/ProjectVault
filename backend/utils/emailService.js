import sgMail from '@sendgrid/mail';

export const sendResetEmail = async (email, token, identifier, userType = "student") => {
  try {
    // Set SG key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Base frontend URL
    //const baseUrl = "http://localhost:3000";
    const baseUrl = "https://projectvault-cbit.onrender.com";
    
    // ✅ Generate correct reset path based on userType
    const resetPath =
      userType === "faculty"
        ? "/faculty/reset-password"
        : "/reset-password"; // student

    const resetLink = `${baseUrl}${resetPath}?token=${token}`;

  // DEBUG: log reset link for local testing (temporary)
  console.log(`🔗 Password reset link: ${resetLink}`);

    const accountLabel = userType === "faculty" ? "Faculty Email" : "Roll Number";

    const msg = {
      to: email,
      from: {
        email: 'projectvault4@gmail.com',
        name: 'ProjectVault'
      },
      subject: `Password Reset Request - ${userType === "faculty" ? "Faculty" : "Student"} Portal`,
      
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #333;">Password Reset Request (${userType.toUpperCase()})</h2>
          <p>Hello,</p>
          <p>You requested a password reset for your ProjectVault ${userType} account (${accountLabel}: ${identifier}).</p>

          <p>Click below to reset your password:</p>
          <a href="${resetLink}"
             style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
            Reset Password
          </a>

          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this, please ignore this email.</p>

          <br><p>Best Regards,<br>ProjectVault Team</p>
        </div>
      `,

      text: `Password Reset Request\n\nHello,\n\nClick to reset your ProjectVault ${userType} password:\n${resetLink}\n\nExpires in 1 hour.\nIf you didn't request this, ignore it.\n\n- ProjectVault Team`
    };

    const result = await sgMail.send(msg);
    console.log("✅ Email sent successfully!");
    return result;

  } catch (error) {
    console.error("❌ SendGrid Error:", error.message);
    if (error.response) console.error(JSON.stringify(error.response.body, null, 2));
    throw new Error(`Failed to send reset email: ${error.message}`);
  }
};
