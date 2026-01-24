import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  userId: string;
  question: string;
  answer: string;
  title?: string;
  isPinned: boolean;
  createdAt: Date;
}

const ChatSchema: Schema = new Schema({
  userId: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  title: { type: String },
  isPinned: { type: Boolean, default: false }
}, { timestamps: true });

// 👇 This line fixes the "no default export" error
export default mongoose.model<IChat>('Chat', ChatSchema);