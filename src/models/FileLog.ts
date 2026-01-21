import mongoose from 'mongoose';

const FileLogSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model('FileLog', FileLogSchema);