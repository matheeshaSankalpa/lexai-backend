import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import adminRoutes from './routes/adminRoutes';
import chatRoutes from './routes/chatRoutes'; // <--- ADDED THIS

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log(`MongoDB Connected: ${mongoose.connection.host}`))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes); // <--- THIS OPENS THE DOOR FOR CHAT

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});