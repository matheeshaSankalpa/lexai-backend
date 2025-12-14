import { Request, Response } from 'express';
import { processDocument } from '../services/ragService';
import fs from 'fs';

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Call the Worker to process the file
    await processDocument(req.file.path);

    // Clean up: Delete the temporary file after saving to DB
    fs.unlinkSync(req.file.path);

    res.status(200).json({ message: "Document processed and saved successfully!" });

  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Failed to process document" });
  }
};