import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/conceptlens';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000 // Fast failover if Mongo not active locally
    });
    isConnected = true;
    console.log('✅ Connected to MongoDB successfully.');
    return true;
  } catch (error: any) {
    console.warn('⚠️ MongoDB connection unavailable. Operating in resilient In-Memory Fallback mode.');
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}

// In-Memory Fallback Store for active learning sessions
export const inMemoryStore = {
  sessions: new Map<string, any>(),
  pyqs: new Map<string, any>(),
  lessons: new Map<string, any>(),
  assets: new Map<string, any>(),
  attempts: new Array<any>()
};
