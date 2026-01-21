import express from 'express';
// 👇 Import the new functions here
import { askQuestion, getHistory, updateChat, deleteChat } from '../controllers/chatController';

const router = express.Router();

// 1. Chat & History
router.post('/ask', askQuestion);
router.get('/history/:userId', getHistory);

// 2. 👇 NEW: Pin, Rename, and Delete
router.put('/history/:id', updateChat);    // Handles Pinning & Renaming
router.delete('/history/:id', deleteChat); // Handles Deleting

export default router;