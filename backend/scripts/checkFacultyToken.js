import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Faculty from '../models/Faculty.js';

dotenv.config();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/checkFacultyToken.js <email>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const faculty = await Faculty.findOne({ email }).lean();
  if (!faculty) {
    console.error('No faculty found with email:', email);
    process.exit(2);
  }

  console.log('Faculty doc for', email);
  console.log('resetPasswordToken:', faculty.resetPasswordToken);
  console.log('resetPasswordExpires:', faculty.resetPasswordExpires);
  if (faculty.resetPasswordExpires) {
    console.log('expires (ISO):', new Date(faculty.resetPasswordExpires).toISOString());
    console.log('now (ISO):', new Date().toISOString());
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(99);
});