import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // DEBUG: Print the variable to see if it is loaded
    console.log("DEBUG: URI is", process.env.MONGODB_URI);

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env file");
    }

    console.log("Attempting to connect...");
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
  }
};