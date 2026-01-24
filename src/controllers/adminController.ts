import { Request, Response } from 'express';
import { addDocument } from '../services/ragService';
import Lawyer from '../models/Lawyer';
import { LawDocument } from '../models/LawDocument'; 
import Stripe from 'stripe';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

// Initialize APIs
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string || 'sk_test_placeholder', {
  apiVersion: '2025-01-27.acacia' as any, 
});

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

/**
 * 1. UPLOAD DOCUMENT
 * Saves the file directly to the LawDocument collection.
 * No FileLog entry is created to avoid "ghost data".
 */
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });

    const { originalname, buffer } = req.file;
    console.log(`📂 Admin uploading: ${originalname}`);

    // Process file and save directly to LawDocument folder
    await addDocument(buffer, originalname);

    res.status(201).json({ message: "Success" });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Failed" });
  }
};

/**
 * 2. GET DOCUMENTS (Replaces Upload Logs)
 * Fetches the real files from LawDocument to show in the table.
 */
export const getUploadLogs = async (req: Request, res: Response) => {
  try {
    // We now fetch from LawDocument instead of FileLog
    const documents = await LawDocument.find().sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error("Get Documents Error:", error);
    res.status(500).json([]); // Returns empty array to prevent dashboard crash
  }
};

/**
 * 3. DELETE DOCUMENT
 * One single command to wipe the file from the database.
 */
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { fileName } = req.params;

    // Delete everything related to this filename in the LawDocument collection
    await LawDocument.deleteMany({ "metadata.source": fileName });

    console.log(`🗑️ Successfully deleted ${fileName} from database.`);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Error deleting file" });
  }
};

/**
 * 4. GET ADMIN STATS
 * Pulls counts from the real data collections.
 */
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    // We count actual LawDocuments now
    const documentCount = await LawDocument.countDocuments();
    const verifiedLawyers = await Lawyer.countDocuments({ isVerified: true });

    // --- Stripe Revenue ---
    let revenueData = [];
    try {
        const charges: any = await stripe.charges.list({ limit: 100 });
        const revenueMap: Record<string, number> = {};
        
        charges.data.forEach((charge: any) => {
            if (charge.status === 'succeeded') {
                const date = new Date(charge.created * 1000); 
                const month = date.toLocaleString('default', { month: 'short' });
                if (!revenueMap[month]) revenueMap[month] = 0;
                revenueMap[month] += (charge.amount / 100);
            }
        });

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const m = d.toLocaleString('default', { month: 'short' });
            revenueData.push({ month: m, revenue: revenueMap[m] || 0 });
        }
    } catch (e) {
        revenueData = [{month: 'N/A', revenue: 0}]; 
    }

    // --- Clerk Users ---
    let totalUsers = 0;
    let userActivityData = [];
    try {
        const clerkRes: any = await clerk.users.getUserList({ limit: 100 });
        totalUsers = await clerk.users.getCount();
        const userList: any[] = Array.isArray(clerkRes) ? clerkRes : (clerkRes as any).data || [];

        const activityMap: Record<string, { standard: number, lawyers: number }> = {};
        userList.forEach((user: any) => {
            const date = new Date(user.createdAt);
            const month = date.toLocaleString('default', { month: 'short' });
            if (!activityMap[month]) activityMap[month] = { standard: 0, lawyers: 0 };
            
            const role = user.publicMetadata?.role as string;
            if (role === 'lawyer') activityMap[month].lawyers++;
            else activityMap[month].standard++;
        });

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const m = d.toLocaleString('default', { month: 'short' });
            userActivityData.push({ 
                month: m, 
                standard: activityMap[m]?.standard || 0, 
                lawyers: activityMap[m]?.lawyers || 0 
            });
        }
    } catch (e) {
        userActivityData = [{month: 'N/A', standard: 0, lawyers: 0}];
    }

    res.json({
      systemHealth: "Online",
      documentCount,
      totalUsers, 
      verifiedLawyers,
      revenueData,      
      userActivityData, 
    });

  } catch (error) {
    res.status(500).json({ message: "Dashboard Error" });
  }
};

/**
 * 5. VERIFY LAWYER
 */
export const verifyLawyer = async (req: Request, res: Response) => {
  try {
    const { lawyerId } = req.params;
    const lawyer = await Lawyer.findByIdAndUpdate(lawyerId, { isVerified: true }, { new: true });
    if (!lawyer) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Verified", lawyer });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};