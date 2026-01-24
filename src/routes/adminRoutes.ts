import express from 'express';
import multer from 'multer';
import { 
  uploadDocument, 
  getUploadLogs, 
  getAdminStats, 
  verifyLawyer, 
  deleteDocument 
} from '../controllers/adminController';

const router = express.Router();

// Setup Multer (File Upload Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- DEFINE ROUTES ---
// 1. Upload Document (Matches 'pdf' field name from frontend)
router.post('/upload', upload.single('pdf'), uploadDocument);

// 2. Get Logs
router.get('/logs', getUploadLogs);

// 3. Get Dashboard Stats
router.get('/stats', getAdminStats);

// 4. Verify Lawyer
router.put('/verify-lawyer/:lawyerId', verifyLawyer);

// 5. Delete Document
router.delete('/document/:fileName', deleteDocument);

export default router;