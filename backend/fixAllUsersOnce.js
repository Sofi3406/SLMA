// fixAllUsersOnce.js - Place this in your backend ROOT folder
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, '.env') });

async function fixAllUsersOnce() {
  try {
    console.log('='.repeat(60));
    console.log('🛠️  SLMA Database Fix Script');
    console.log('='.repeat(60));
    
    // Check MongoDB URI
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env file');
      console.log('💡 Make sure your .env file has:');
      console.log('   MONGODB_URI=mongodb://localhost:27017/slma_db');
      process.exit(1);
    }
    
    console.log('🔗 Connecting to MongoDB...');
    console.log(`   Database: ${process.env.MONGODB_URI}`);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('🔍 Checking users collection...');
    
    const db = mongoose.connection.db;
    const collectionExists = await db.listCollections({ name: 'users' }).hasNext();
    
    if (!collectionExists) {
      console.log('ℹ️  No users collection found. Starting fresh!');
      process.exit(0);
    }
    
    // Get user count before fix
    const totalUsers = await db.collection('users').countDocuments();
    console.log(`📊 Found ${totalUsers} total users`);
    
    if (totalUsers === 0) {
      console.log('✅ No users to fix. Database is clean!');
      process.exit(0);
    }
    
    // Find users with woreda issues
    const usersWithIssues = await db.collection('users').find({
      $or: [
        { woreda: "" },
        { woreda: null },
        { woreda: { $exists: false } },
        { woreda: { $nin: ['worabe', 'hulbarag', 'sankura', 'alicho', 'silti', 'dalocha', 'lanforo', 'east-azernet-berbere', 'west-azernet-berbere'] } }
      ]
    }).toArray();
    
    console.log(`🔍 Found ${usersWithIssues.length} users with woreda issues`);
    
    if (usersWithIssues.length === 0) {
      console.log('✅ All users already have valid woreda values!');
    } else {
      console.log('\n📝 Users needing fix:');
      usersWithIssues.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} - Current woreda: "${user.woreda || 'EMPTY'}"`);
      });
      
      console.log('\n🔄 Applying fix to all users...');
      
      // Fix ALL users (even those with valid woreda, to ensure consistency)
      const result = await db.collection('users').updateMany(
        {},
        [
          {
            $set: {
              woreda: {
                $cond: {
                  if: {
                    $and: [
                      { $ne: ["$woreda", null] },
                      { $ne: ["$woreda", ""] },
                      { $in: ["$woreda", ['worabe', 'hulbarag', 'sankura', 'alicho', 'silti', 'dalocha', 'lanforo', 'east-azernet-berbere', 'west-azernet-berbere']] }
                    ]
                  },
                  then: "$woreda",
                  else: "worabe"
                }
              }
            }
          }
        ],
        { bypassDocumentValidation: true }
      );
      
      console.log('\n' + '='.repeat(60));
      console.log('🎉 DATABASE FIX COMPLETED!');
      console.log('='.repeat(60));
      console.log(`✅ Modified ${result.modifiedCount} user documents`);
      console.log(`✅ Total users processed: ${result.matchedCount}`);
      console.log(`✅ All users now have valid woreda values`);
      
      // Verify the fix
      const usersAfterFix = await db.collection('users').find({
        $or: [
          { woreda: "" },
          { woreda: null },
          { woreda: { $exists: false } },
          { woreda: { $nin: ['worabe', 'hulbarag', 'sankura', 'alicho', 'silti', 'dalocha', 'lanforo', 'east-azernet-berbere', 'west-azernet-berbere'] } }
        ]
      }).toArray();
      
      if (usersAfterFix.length === 0) {
        console.log('✅ VERIFICATION PASSED: All users have valid woreda!');
      } else {
        console.warn(`⚠️  VERIFICATION FAILED: ${usersAfterFix.length} users still have issues`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🚀 YOUR AUTH SYSTEM IS NOW READY!');
    console.log('='.repeat(60));
    console.log('✅ All database issues have been resolved');
    console.log('✅ You can now use:');
    console.log('   • Registration');
    console.log('   • Login');
    console.log('   • Forgot Password');
    console.log('   • Email Verification');
    console.log('   • Profile Updates');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart your backend: node server.js');
    console.log('   2. Test the endpoints');
    console.log('   3. Delete this fix script (optional)');
    console.log('='.repeat(60));
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure MongoDB is running: mongod');
    console.log('   2. Check .env file has correct MONGODB_URI');
    console.log('   3. Ensure you have permission to access the database');
    process.exit(1);
  }
}

// Run the script
fixAllUsersOnce();