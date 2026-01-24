import mongoose, { Schema, Document } from 'mongoose';

export interface ILawyer extends Document {
  userId: string; // Clerk ID
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  
  // Searchable Data (For Vector & Filter)
  specialization: string; // e.g., "Criminal Law", "Labor Law"
  experience: number;     // Years of experience
  location: string;       // e.g., "Colombo", "Kandy"
  languages: string[];    // e.g., ["Sinhala", "English"]
  bio: string;            // The "Story" for the AI to read
  
  // Status
  isVerified: boolean;
  paymentStatus: 'pending' | 'paid';
}

const LawyerSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  profileImage: { type: String, default: "" },

  // The important fields for your AI
  specialization: { type: String, default: "General" },
  experience: { type: Number, default: 1 },
  location: { type: String, default: "Colombo" },
  languages: { type: [String], default: ["English"] },
  bio: { type: String, default: "" },

  isVerified: { type: Boolean, default: false },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model<ILawyer>('Lawyer', LawyerSchema);