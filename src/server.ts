import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db';
import adminRoutes from './routes/adminRoutes'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Start Server FIRST
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // 2. Connect to Database SECOND
  connectDB();
});

app.get('/', (req: Request, res: Response) => {
  res.send('LexAI Backend is Running Successfully!');
});

app.use('/api/admin', adminRoutes);