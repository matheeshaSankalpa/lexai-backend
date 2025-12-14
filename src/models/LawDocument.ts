import mongoose from 'mongoose';

const LawDocumentSchema = new mongoose.Schema({
  // The actual text of the law (e.g., "Section 5: Theft...")
  content: {
    type: String,
    required: true,
  },
  // The source (e.g., "Penal Code of Sri Lanka")
  metadata: {
    source: String,
    page: Number,
  },
  // The "Vector" (The math numbers for AI search)
  embedding: {
    type: [Number], // An array of numbers
    required: true,
    index: true, // IMPORTANT: We need this for fast search later
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const LawDocument = mongoose.model('LawDocument', LawDocumentSchema);