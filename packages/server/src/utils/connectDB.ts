import mongoose from 'mongoose';
import customConfig from '../config/default';

const dbUrl = customConfig.dbUri;

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
