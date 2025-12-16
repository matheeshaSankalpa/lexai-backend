import { Request, Response } from 'express';
import { ragService } from '../services/ragService';

export const askQuestion = async (req: Request, res: Response) => {
  try {
    // 1. Get the question from the user
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Please provide a question!" });
    }

    console.log(`📨 Controller received question: "${question}"`);

    // 2. Ask the RAG Service (The Brain)
    const answer = await ragService.askQuestion(question);

    // 3. Send the answer back
    res.status(200).json({ answer: answer });

  } catch (error) {
    console.error("❌ Chat Error:", error);
    res.status(500).json({ message: "Something went wrong processing your question." });
  }
};