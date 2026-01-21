import { Request, Response } from 'express';
import { ragService } from '../services/ragService';
import { clerkClient } from '@clerk/clerk-sdk-node';
import FileLog from '../models/FileLog'; // <--- Import the new simple model

// 1. Upload Document
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "No PDF file uploaded!" });
    }

    console.log(`📥 Processing: ${req.file.originalname}`);

    // A. Send to AI Brain (Your existing logic)
    await ragService.addDocument(req.file.buffer, req.file.originalname);

    // B. 🔥 SAVE TO LOG (So we can count it!)
    await FileLog.create({
      fileName: req.file.originalname
    });

    res.status(200).json({ message: "Success! Document saved." });

  } catch (error) {
    console.error("❌ Upload Error:", error);
    res.status(500).json({ message: "Failed to process document." });
  }
};

// 2. Admin Stats
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    // A. User Count (Clerk)
    let userCount = 0;
    try {
       if(process.env.CLERK_SECRET_KEY) {
         userCount = await clerkClient.users.getCount();
       }
    } catch(e) { console.error("Clerk Error", e); }

    // B. 🔥 File Count (From our new simple log)
    const docCount = await FileLog.countDocuments();

    res.status(200).json({
      users: userCount,
      documents: docCount, // <--- This will now be correct (e.g., 1, 2, 3)
      systemStatus: "Healthy"
    });

  } catch (error) {
    console.error("❌ Stats Error:", error);
    // Fallback if everything fails
    res.status(200).json({ users: 0, documents: 0, systemStatus: "Error" });
  }
};