import sgMail from '@sendgrid/mail';

export const sendResetEmail = async (email, token, roll) => {
  try {
    console.log('=== SENDGRID CONFIGURATION ===');
    console.log('API Key present:', !!process.env.SENDGRID_API_KEY);
    console.log('API Key starts with:', process.env.SENDGRID_API_KEY?.substring(0, 10) + '...');
    console.log('From email: projectvault4@gmail.com');
    console.log('To email:', email);
    
    // Set API key inside the function
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    const msg = {
      to: email,
      from: {
        email: 'projectvault4@gmail.com',
        name: 'ProjectVault'
      },
      subject: 'Password Reset Request - ProjectVault',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You requested a password reset for your ProjectVault account (Roll Number: ${roll}).</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" 
             style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
             Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <br>
          <p>Best regards,<br>ProjectVault Team</p>
        </div>
      `,
      text: `Password Reset Request\n\nHello,\n\nYou requested a password reset for your ProjectVault account (Roll Number: ${roll}).\n\nClick this link to reset your password: ${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nProjectVault Team`
    };

    console.log('Attempting to send email...');
    const result = await sgMail.send(msg);
    console.log('✅ Email sent successfully! Response:', result[0]?.statusCode);
    console.log('Message ID:', result[0]?.headers?.['x-message-id']);
    
    return result;
    
  } catch (error) {
    console.error('❌ SendGrid Error Details:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.statusCode);
      console.error('Response body:', JSON.stringify(error.response.body, null, 2));
      console.error('Response headers:', error.response.headers);
    }
    
    throw new Error(`Failed to send reset email: ${error.message}`);
  }
};