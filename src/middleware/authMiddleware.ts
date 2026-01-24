import { Request, Response, NextFunction } from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

// This middleware checks if a valid Clerk Token exists in the request
// It throws a 401 error if the user is not logged in.
export const requireAuth = ClerkExpressRequireAuth({
  // This usually works automatically if CLERK_SECRET_KEY is in .env
});

// Optional: Strict Admin Check
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore - Clerk attaches auth to the request
  const auth = req.auth;

  if (!auth || !auth.userId) {
    return res.status(401).json({ message: "Unauthorized: Please Login" });
  }

  // If you want to check for a specific User ID (e.g. YOUR ID):
  // const MY_ADMIN_ID = "user_2s..."; 
  // if (auth.userId !== MY_ADMIN_ID) {
  //    return res.status(403).json({ message: "Forbidden: Admins Only" });
  // }

  next();
};