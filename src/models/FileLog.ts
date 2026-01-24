import mongoose, { Schema, Document } from 'mongoose';

// 1. Define the Interface (Typescript needs this to know what .create accepts)
export interface IFileLog extends Document {
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  status: string;
  createdAt: Date;
}

// 2. Define the Schema (MongoDB needs this)
const FileLogSchema: Schema = new Schema({
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadedBy: { type: String, required: true }, // e.g., "Admin"
  status: { type: String, default: "Processed" },
}, { timestamps: true });

// 3. Export properly
export default mongoose.model<IFileLog>('FileLog', FileLogSchema);