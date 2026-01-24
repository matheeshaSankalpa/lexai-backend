import express from 'express';
import { createCheckoutSession } from '../controllers/paymentController';

const router = express.Router();

router.post('/create-checkout-session', createCheckoutSession);

export default router;