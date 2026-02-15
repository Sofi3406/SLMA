/**
 * Set Sofiya Yasin (sofiyasin190@gmail.com) as super admin.
 * Run: node script/set-super-admin.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

dotenv.config();

const SUPER_ADMIN = {
  email: 'sofiyasin190@gmail.com',
  password: 'Sofi@123',
  name: 'Sofiya Yasin',
  profession: 'computer_science',
  currentResident: 'Addis Ababa',
  maritalStatus: 'single',
  userType: 'student',
  woreda: 'hulbarag',
  phone: '+251930670088',
};

async function setSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/slma');
    console.log('Connected to DB');

    const existing = await User.findOne({ email: SUPER_ADMIN.email }).select('+password');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN.password, salt);

    if (existing) {
      existing.role = 'super_admin';
      existing.emailVerified = true;
      existing.isActive = true;
      existing.name = SUPER_ADMIN.name;
      existing.profession = SUPER_ADMIN.profession;
      existing.currentResident = SUPER_ADMIN.currentResident;
      existing.maritalStatus = SUPER_ADMIN.maritalStatus;
      existing.userType = SUPER_ADMIN.userType;
      existing.woreda = SUPER_ADMIN.woreda;
      existing.phone = SUPER_ADMIN.phone;
      existing.password = hashedPassword;
      existing.membership = existing.membership || {};
      existing.membership.status = 'active';
      existing.membership.membershipId = existing.membership.membershipId || 'SLMA-ADMIN-001';
      existing.membership.type = 'executive';
      await existing.save({ validateBeforeSave: false });
      console.log('✅ Updated existing user to super_admin:', SUPER_ADMIN.email);
    } else {
      const admin = new User({
        name: SUPER_ADMIN.name,
        email: SUPER_ADMIN.email,
        password: hashedPassword,
        phone: SUPER_ADMIN.phone,
        woreda: SUPER_ADMIN.woreda,
        role: 'super_admin',
        language: 'en',
        emailVerified: true,
        isActive: true,
        profession: SUPER_ADMIN.profession,
        currentResident: SUPER_ADMIN.currentResident,
        maritalStatus: SUPER_ADMIN.maritalStatus,
        userType: SUPER_ADMIN.userType,
        membership: {
          membershipId: 'SLMA-ADMIN-001',
          status: 'active',
          type: 'executive',
        },
      });
      await admin.save({ validateBeforeSave: false });
      console.log('✅ Created new super_admin:', SUPER_ADMIN.email);
    }

    console.log('');
    console.log('Login with:');
    console.log('  Email:', SUPER_ADMIN.email);
    console.log('  Password:', SUPER_ADMIN.password);
    console.log('');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

setSuperAdmin();
