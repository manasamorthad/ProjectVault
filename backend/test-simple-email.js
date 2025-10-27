import dotenv from 'dotenv';
dotenv.config();

import sgMail from '@sendgrid/mail';

async function testSimpleEmail() {
  try {
    console.log('Testing with API key:', process.env.SENDGRID_API_KEY?.substring(0, 10) + '...');
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: 'eranaguruspandana@gmail.com', // Use your actual email
      from: 'projectvault4@gmail.com',
      subject: 'Simple Test from ProjectVault',
      text: 'This is a simple test email',
      html: '<strong>This is a simple test email</strong>'
    };

    const result = await sgMail.send(msg);
    console.log('✅ Simple test email sent successfully!');
    console.log('Status:', result[0].statusCode);
    
  } catch (error) {
    console.error('❌ Simple test failed:');
    console.error(error.response?.body || error.message);
  }
}

testSimpleEmail();