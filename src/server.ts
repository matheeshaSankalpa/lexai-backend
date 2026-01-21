import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import adminRoutes from './routes/adminRoutes';
import chatRoutes from './routes/chatRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- 🔥 CORS FIX (CRASH FREE VERSION) 🔥 ---
// We removed the "app.options" line that caused the crash.
// This global setting is enough to handle everything.
app.use(cors({
  origin: "http://localhost:5173", // Allow your frontend
  credentials: true,               // Allow cookies/tokens
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log(`✅ MongoDB Connected`))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});