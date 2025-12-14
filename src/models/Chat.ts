import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  // Who sent this? (The Clerk User ID)
  userId: {
    type: String,
    required: true,
    index: true, 
  },
  // What did they ask?
  question: {
    type: String,
    required: true,
  },
  // What did the AI answer?
  answer: {
    type: String,
    required: true,
  },
  // When did it happen?
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

export const Chat = mongoose.model('Chat', ChatSchema);