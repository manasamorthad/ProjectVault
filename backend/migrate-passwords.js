// backend/migrate-passwords.js
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import your User model (adjust path as needed)
import User from "./models/User.js";

async function hashExistingPasswords() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users in database`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (let user of users) {
      // Skip if no password or already hashed (bcrypt hashes start with $2)
      if (!user.password) {
        console.log(`⏭️  Skipping user ${user.roll} - no password`);
        skippedCount++;
        continue;
      }

      // Check if password is already hashed (bcrypt pattern)
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
        console.log(`⏭️  Skipping user ${user.roll} - password already hashed`);
        skippedCount++;
        continue;
      }

      // Hash the plain text password
      console.log(`🔐 Hashing password for user: ${user.roll}`);
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
      await user.save();
      updatedCount++;
      console.log(`✅ Hashed password for user: ${user.roll}`);
    }

    console.log('\n================================');
    console.log('📋 MIGRATION SUMMARY:');
    console.log(`✅ Updated: ${updatedCount} users`);
    console.log(`⏭️  Skipped: ${skippedCount} users`);
    console.log(`📊 Total: ${users.length} users`);
    console.log('================================\n');

    console.log('🎉 Password migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Run the migration
hashExistingPasswords();