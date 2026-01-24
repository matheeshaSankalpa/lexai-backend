import { Request, Response } from 'express';
import Chat from '../models/Chat';
import Lawyer from '../models/Lawyer';
import { generateAIResponse, searchLaws } from '../services/ragService';
import { INTAKE_SYSTEM_PROMPT } from '../config/prompts';

// --- 1. ASK QUESTION ---
export const askQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, question, history } = req.body; 

    // 1. RUN INTAKE INTERVIEW
    const conversation = [
      { role: "system", content: INTAKE_SYSTEM_PROMPT },
      ...(history || []).map((msg: any) => ({ 
          role: msg.sender === 'user' ? 'user' : 'assistant', 
          content: msg.text 
      })),
      { role: "user", content: question }
    ];

    let aiResponse = await generateAIResponse(conversation);

    // 🛑 CLEANUP: Sometimes Gemma adds "Based on..." text. Remove it.
    const jsonMatch = aiResponse.match(/\{[\s\S]*"status":\s*"COMPLETE"[\s\S]*\}/);

    // --- SCENARIO A: STILL INTERVIEWING ---
    if (!jsonMatch) {
      // If AI hallucinates a report without JSON, force a retry question
      if (aiResponse.includes("Situation Analysis") || aiResponse.includes("Applicable Laws")) {
         aiResponse = "I need one more detail. Where is your workplace located (City)?";
      }
      res.json({ answer: aiResponse, recommendedLawyer: null });
      return;
    }

    // --- SCENARIO B: JSON DETECTED ---
    const data = JSON.parse(jsonMatch[0]);
    
    // 🛑 HALLUCINATION CHECK (The logic that failed before)
    // We check if "LOCATION" is still unknown or generic
    if (data.location === "UNKNOWN" || data.location.toLowerCase().includes("location")) {
       console.log("⚠️ Hallucination blocked. AI tried to finish without location.");
       res.json({ 
         answer: "I missed that. Could you please tell me which city you are in?", 
         recommendedLawyer: null 
       });
       return;
    }

    // --- SCENARIO C: SUCCESS ---
    console.log("✅ Interview Complete:", data);
    const { summary, location, legal_query } = data;

    // 1. Search Laws
    const lawDocs = await searchLaws(legal_query);
    const lawReferences = lawDocs.length > 0 ? lawDocs.join("\n\n") : "General Industrial Disputes Act.";

    // 2. Find Lawyer
    let specialization = "Civil Law";
    if (summary.toLowerCase().includes("fired") || summary.toLowerCase().includes("termination")) {
      specialization = "Labor Law";
    }

    const bestLawyer = await Lawyer.findOne({
      isVerified: true,
      location: { $regex: new RegExp(location, "i") },
      specialization: { $regex: new RegExp(specialization, "i") }
    }).select('name specialization location profileImage phone bio');

    // 3. Generate CLEAN Final Output (New Prompt for Final Answer)
    const finalPrompt = [
      { role: "system", content: "You are a Senior Lawyer. Format your answer cleanly using the data below." },
      { role: "user", content: `
        CLIENT FACTS: ${summary}
        LAWS FOUND: ${lawReferences}
        
        TASK: Write a response in this structure (No emojis):
        
        1. Situation Analysis
        (Summarize the case in 2 sentences)

        2. Applicable Laws
        (List the specific acts found in LAWS FOUND)

        3. Recommendation
        (Advise to contact the lawyer below)
      `}
    ];

    const finalAnswer = await generateAIResponse(finalPrompt);

    await Chat.create({ userId, question, answer: finalAnswer });

    res.json({
      answer: finalAnswer,
      recommendedLawyer: bestLawyer || null,
      chatId: Date.now()
    });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ message: "System Error" });
  }
};

// ... (Keep getHistory, updateChat, deleteChat same as before) ...
export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const history = await Chat.find({ userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history" });
  }
};

export const updateChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedChat = await Chat.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: "Error updating chat" });
  }
};

export const deleteChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Chat.findByIdAndDelete(id);
    res.json({ message: "Chat deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting chat" });
  }
};