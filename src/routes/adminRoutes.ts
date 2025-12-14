import express from 'express';
import multer from 'multer';
import { uploadDocument } from '../controllers/adminController';

const router = express.Router();

// Setup Multer (This creates a 'uploads' folder to hold files temporarily)
const upload = multer({ dest: 'uploads/' });

// The Route: POST /api/admin/upload
// It expects a file named 'pdf'
router.post('/upload', upload.single('pdf'), uploadDocument);

// CRITICAL: This allows other files to use this router
export default router;