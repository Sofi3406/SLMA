import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || typeof uri !== 'string') {
    console.error('❌ MongoDB Connection Error: MONGODB_URI is not set.');
    console.error('   Create a .env file in the backend folder and add:');
    console.error('   MONGODB_URI=mongodb://127.0.0.1:27017/slma');
    console.error('   (Or copy from .env.example: copy .env.example .env)');
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;