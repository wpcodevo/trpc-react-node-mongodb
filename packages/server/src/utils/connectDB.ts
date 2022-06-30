import path from 'path';
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
import mongoose from 'mongoose';

const dbUrl = process.env.MONGODB_URI as string;

const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log('🚀 Database connected...');
  } catch (error: any) {
    console.log(error);
    process.exit(1);
  }
};

export default connectDB;
