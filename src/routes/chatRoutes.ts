import express from 'express';
import { askQuestion } from '../controllers/chatController';

const router = express.Router();

// The Endpoint: POST /api/chat/ask
router.post('/ask', askQuestion);

export default router;