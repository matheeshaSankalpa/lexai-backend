import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true }, 
  question: { type: String, required: true },
  answer: { type: String, required: true },
  
  // 👇 NEW FIELDS ADDED
  title: { type: String }, 
  isPinned: { type: Boolean, default: false },

  timestamp: { type: Date, default: Date.now }
});

export const Chat = mongoose.model('Chat', ChatSchema);