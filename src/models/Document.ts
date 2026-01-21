import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  content: { type: String, required: true }, // The text of the law
  metadata: { type: Object },                // Extra info (source, page number)
  embedding: { type: [Number], required: true }, // The Vector numbers for search
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Document', DocumentSchema);