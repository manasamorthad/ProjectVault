import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const updateSchema = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update the collection schema
    const result = await mongoose.connection.db.collection('faculties').updateMany(
      {},  // match all documents
      {
        $set: {
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      },
      { upsert: false }
    );

    console.log('Schema update complete:');
    console.log('- Matched documents:', result.matchedCount);
    console.log('- Modified documents:', result.modifiedCount);

    // Verify a specific faculty member (optional)
    const email = process.argv[2];
    if (email) {
      const faculty = await mongoose.connection.db.collection('faculties').findOne({ email });
      if (faculty) {
        console.log('\nVerified faculty document:');
        console.log('- Email:', faculty.email);
        console.log('- Has resetPasswordToken field:', faculty.hasOwnProperty('resetPasswordToken'));
        console.log('- Has resetPasswordExpires field:', faculty.hasOwnProperty('resetPasswordExpires'));
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

updateSchema().catch(console.error);