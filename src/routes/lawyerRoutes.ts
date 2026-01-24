import express from 'express';
import { 
  getLawyers,           // matches your good code
  updateLawyerProfile,  // matches your good code
  getLawyerByUserId     // matches your good code
} from '../controllers/lawyerController';

const router = express.Router();

// 1. Get all lawyers (For the Find Lawyer page)
router.get('/', getLawyers); 

// 2. Get a single lawyer by ID
router.get('/:userId', getLawyerByUserId);

// 3. Save or Update profile
router.post('/', updateLawyerProfile);

export default router;