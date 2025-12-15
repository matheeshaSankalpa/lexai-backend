import { Request, Response } from 'express';
import { ragService } from '../services/ragService';
import fs from 'fs';

// I renamed this back to 'uploadDocument' to fix the error!
export const uploadDocument = async (req: Request, res: Response) => {
  console.log("👉 STEP 1: Request received at Controller");

  try {
    if (!req.file) {
      console.log("❌ ERROR: No file found in request");
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    console.log(`👉 STEP 2: File detected! Name: ${req.file.originalname}`);
    console.log(`👉 STEP 3: File path is: ${req.file.path}`);

    // Call the AI Service
    console.log("👉 STEP 4: Sending to AI Brain (ragService)...");
    await ragService.addDocument(req.file.path);
    
    console.log("✅ STEP 5: AI finished successfully!");

    // Cleanup
    fs.unlinkSync(req.file.path);
    console.log("👉 STEP 6: Temporary file deleted");

    res.status(200).json({ message: "Document processed and stored successfully" });

  } catch (error) {
    console.log("❌ CRITICAL ERROR CAUGHT!");
    console.error(error); // This prints the real reason
    res.status(500).json({ message: "Failed to process document" });
  }
};