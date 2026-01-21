import express from 'express';
import multer from 'multer';
// 1. FIX: Import getAdminStats here
import { uploadDocument, getAdminStats } from '../controllers/adminController';

const router = express.Router();

// Use 'memoryStorage' (RAM)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
// 2. FIX: Change 'pdf' to 'file' so it matches your Frontend code
router.post('/upload', upload.single('file'), uploadDocument);

// 3. Now this will work because we imported it
router.get('/stats', getAdminStats);

export default router;