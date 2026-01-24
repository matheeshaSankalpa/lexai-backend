import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Import Routes
import adminRoutes from './routes/adminRoutes';
import chatRoutes from './routes/chatRoutes';
import lawyerRoutes from './routes/lawyerRoutes'; 
import paymentRoutes from './routes/paymentRoutes';
import contactRoutes from './routes/contactRoutes'; // 👈 Added this

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"], 
  credentials: true,
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
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/contact', contactRoutes); // 👈 Fixed 404 for Contact

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});