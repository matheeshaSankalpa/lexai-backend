import { Request, Response } from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe with your Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-12-18.acacia' as any,
});

export const createCheckoutSession = async (req: Request, res: Response) => {
  console.log("💰 Payment Request Received...");

  try {
    const { email, userId, name } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'lkr',
            product_data: {
              name: 'LexAI Pro Lawyer Subscription',
              description: 'Access to Lawyer Dashboard & Client Leads',
            },
            unit_amount: 500000, // 5000.00 LKR
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      
      // 👇 THIS REDIRECTS TO YOUR WHATSAPP PAGE
      success_url: `http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/join-lawyer`,
      
      metadata: {
        userId: userId,
        email: email,
        name: name
      }
    });

    console.log("✅ Session Created! URL:", session.url);
    
    // Return both ID and URL
    res.json({ id: session.id, url: session.url });

  } catch (error: any) {
    console.error("❌ STRIPE ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};