import { Request, Response } from 'express';
import Lawyer from '../models/Lawyer';

// 1. Save or Update Lawyer Profile
// @desc    Register/Update Lawyer Profile
// @route   POST /api/lawyers
export const updateLawyerProfile = async (req: Request, res: Response) => {
  try {
    const { userId, email, name, phone, specialization, experience, location, bio, languages, profileImage } = req.body;

    // Use findOneAndUpdate with "upsert: true"
    // This means: "Find by userId. If found, update it. If not found, create a new one."
    const lawyer = await Lawyer.findOneAndUpdate(
      { userId },
      {
        userId,
        email,
        name,
        phone,
        specialization,
        experience,
        location,
        bio,
        languages, // This expects an array of strings like ["English", "Sinhala"]
        profileImage,
        // We do NOT update 'isVerified' here. Only Admin can change that.
      },
      { new: true, upsert: true } // Options: return the new document, create if missing
    );

    res.status(201).json(lawyer);
  } catch (error) {
    console.error("Save Profile Error:", error);
    res.status(500).json({ message: 'Server Error', error });
  }
};

// 2. Get All Lawyers (With Filters for Public Search)
// @desc    Get All Lawyers
// @route   GET /api/lawyers?location=Colombo&specialization=Labor+Law
export const getLawyers = async (req: Request, res: Response) => {
  try {
    const { location, specialization } = req.query;
    
    // 👇 CHANGED FOR TESTING:
    // We removed { isVerified: true } so you can see your unverified profile.
    // Later, change this back to: let query: any = { isVerified: true };
    let query: any = {}; 

    // If user selects a specific location
    if (location && location !== 'All Locations') {
      query.location = location;
    }

    // If user selects a specific specialization
    if (specialization && specialization !== 'All Specializations') {
      query.specialization = specialization;
    }

    // Sort by newest first
    const lawyers = await Lawyer.find(query).sort({ createdAt: -1 });
    
    res.json(lawyers);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: 'Server Error', error });
  }
};

// 3. Get Single Lawyer (For Security Check & Profile Load)
// @desc    Get Single Lawyer by User ID
// @route   GET /api/lawyers/:userId
export const getLawyerByUserId = async (req: Request, res: Response) => {
  try {
    const lawyer = await Lawyer.findOne({ userId: req.params.userId });

    if (!lawyer) {
      return res.status(404).json({ message: "Not a lawyer" });
    }

    res.json(lawyer);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};