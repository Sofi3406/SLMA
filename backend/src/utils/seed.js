import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Woreda from '../models/Woreda.js';
import MembershipPlan from '../models/MembershipPlan.js';
import User from '../models/User.js';

dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

const seedWoredas = async () => {
  const woredas = [
    {
      name: 'Worabe',
      nameAmharic: 'ወራቤ',
      nameSiltigna: 'ወራቤ', 
      description: 'Capital city of Silte Zone',
      descriptionAmharic: 'የስልጤ ዞን ዋና ከተማ',
      descriptionSiltigna: 'የስልጤ ዞን ቡር ከተማ', 
      coordinates: { lat: 8.0167, lng: 38.3667 },
    },
    {
      name: 'Hulbarag',
      nameAmharic: 'ሁልበራግ',
      nameSiltigna: 'ሁልበራግ',
      description: 'Hulbarag Woreda',
      descriptionAmharic: 'ሁልበራግ ወረዳ',
      descriptionSiltigna: 'ሁልበራግ ወረዳ',
      coordinates: { lat: 7.9167, lng: 38.2167 },
    },
    {
      name: 'Sankura',
      nameAmharic: 'ሳንኩራ',
      nameSiltigna: 'ሳንኩራ',
      description: 'Sankura Woreda',
      descriptionAmharic: 'ሳንኩራ ወረዳ',
      descriptionSiltigna: 'ሳንኩራ ወረዳ',
      coordinates: { lat: 7.7833, lng: 38.5333 },
    },
    {
      name: 'Alicho',
      nameAmharic: 'አሊቾ',
      nameSiltigna: 'አሊቾ',
      description: 'Alicho Woreda',
      descriptionAmharic: 'አሊቾ ወረዳ',
      descriptionSiltigna: 'አሊቾ ወረዳ',
      coordinates: { lat: 7.6833, lng: 38.4333 },
    },
    {
      name: 'Silti',
      nameAmharic: 'ስልጢ',
      nameSiltigna: 'ስልጢ',
      description: 'Silti Woreda',
      descriptionAmharic: 'ስልጢ ወረዳ',
      descriptionSiltigna: 'ስልጢ ወረዳ',
      coordinates: { lat: 7.5833, lng: 38.3333 },
    },
    {
      name: 'Dalocha',
      nameAmharic: 'ደሎቻ',
      nameSiltigna: 'ደሎቻ',
      description: 'Dalocha Woreda',
      descriptionAmharic: 'ደሎቻ ወረዳ',
      descriptionSiltigna: 'ደሎቻ ወረዳ',
      coordinates: { lat: 7.8833, lng: 38.2833 },
    },
    {
      name: 'Lanforo',
      nameAmharic: 'ላንፎሮ',
      nameSiltigna: 'ላንፎሮ',
      description: 'Lanforo Woreda',
      descriptionAmharic: 'ላንፎሮ ወረዳ',
      descriptionSiltigna: 'ላንፎሮ ወረዳ',
      coordinates: { lat: 7.7333, lng: 38.3833 },
    },
    {
      name: 'East Azernet Berbere',
      nameAmharic: 'ምሥራቅ አዘነርት በርበሬ',
      nameSiltigna: 'ሸርቅ አዘነርት በርበሬ',
      description: 'East Azernet Berbere Woreda',
      descriptionAmharic: 'ምሥራቅ አዘነርት በርበሬ ወረዳ',
      descriptionSiltigna: 'ሸርቅ አዘነርት በርበሬ ወረዳ',
      coordinates: { lat: 7.6333, lng: 38.4833 },
    },
    {
      name: 'West Azernet Berbere',
      nameAmharic: 'ምዕራብ አዘነርት በርበሬ',
      nameSiltigna: 'ገርብ አዘነርት በርበሬ',
      description: 'West Azernet Berbere Woreda',
      descriptionAmharic: 'ምዕራብ አዘነርት በርበሬ ወረዳ',
      descriptionSiltigna: 'ገርብ አዘነርት በርበሬ ወረዳ',
      coordinates: { lat: 7.5333, lng: 38.5833 },
    },
  ];

  await Woreda.deleteMany({});
  await Woreda.insertMany(woredas);
  console.log('✅ Woredas seeded');
};

const seedAdminUser = async () => {
  const adminName = process.env.ADMIN_NAME || 'Sofiya Yasin';
  const adminEmail = process.env.ADMIN_EMAIL || 'sofiyasin190@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Sofi@123!';

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  const admin = new User({
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: 'super_admin',
    language: 'en',
    emailVerified: true,
    membership: {
      membershipId: 'SLMA-ADMIN-001',
      status: 'active',
      type: 'executive',
    },
  });

  await User.deleteOne({ email: adminEmail });
  await admin.save();
  console.log(`✅ Admin user seeded (email: ${adminEmail}, password: ${adminPassword})`);
};

const seedData = async () => {
  try {
    await seedWoredas();

    // Only create admin if explicitly allowed via environment variable
    // Set ADMIN_SEED_ALLOWED=true to enable seeding admin (protects production)
    if (process.env.ADMIN_SEED_ALLOWED === 'true') {
      await seedAdminUser();
      console.log('✅ Admin seeding completed');
    } else {
      console.log('⚠️ ADMIN_SEED_ALLOWED not set to true — skipping admin seed');
    }

    console.log('✅ All data seeded (woredas + optional admin).');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();