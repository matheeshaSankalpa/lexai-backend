import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const sendContactEmail = async (req: Request, res: Response) => {
  console.log("📨 Attempting to send email...");

  // Debugging: Check if environment variables are loaded
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ CRITICAL ERROR: EMAIL_USER or EMAIL_PASS is missing in .env");
      return res.status(500).json({ message: "Server configuration error" });
  }

  const { name, phone, email, subject, message } = req.body;

  try {
    // 1. Setup Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS?.trim() // Removes accidental spaces
      },
      // 👇 THIS FIXES YOUR "Self-Signed Certificate" ERROR
      tls: {
        rejectUnauthorized: false
      }
    });

    // 2. Configure Email
    const mailOptions = {
      from: `LexAI Contact <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Sends to yourself
      replyTo: email, // If you click Reply, it goes to the user
      subject: `📩 New Inquiry: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #1e293b;">New Contact Message</h2>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <h3 style="color: #475569;">Message:</h3>
          <p style="background: #f8fafc; padding: 15px; border-radius: 5px; color: #334155;">${message}</p>
        </div>
      `
    };

    // 3. Send Email
    await transporter.sendMail(mailOptions);
    
    console.log("✅ Email sent successfully!");
    res.status(200).json({ message: "Email sent successfully" });

  } catch (error: any) {
    console.error("❌ EMAIL SENDING FAILED:", error.message);
    res.status(500).json({ message: "Failed to send email" });
  }
};