import { Request, Response } from "express";
import ollama from "ollama";
import Document from "../models/Document"; 
import { Chat } from "../models/Chat"; 

// 1. ASK QUESTION (Your original logic + Title support)
export const askQuestion = async (req: Request, res: Response) => {
  try {
    const { question, userId } = req.body; 
    
    console.log("-------------------------------------------------");
    console.log(`👤 User ID Received: ${userId}`);
    console.log(`❓ Question: ${question}`);

    // --- 1. Vector Search (Your working code) ---
    const embeddingResponse = await ollama.embeddings({
      model: "nomic-embed-text",
      prompt: question,
    });

    const documents = await Document.aggregate([
      {
        "$vectorSearch": {
          "index": "vector_index", 
          "path": "embedding",
          "queryVector": embeddingResponse.embedding,
          "numCandidates": 50,
          "limit": 3 
        }
      },
      { "$project": { "content": 1, "_id": 0 } }
    ]);

    const contextText = documents.length > 0 
      ? documents.map((doc: any) => doc.content).join("\n\n---\n\n")
      : "No specific legal documents found.";

    // --- 2. Generate Answer ---
    const systemPrompt = `
      You are LexAI, a legal assistant for Sri Lanka.
      Context: "${contextText}"
      INSTRUCTIONS:
      - Use **Markdown** (Bold, Bullet points).
      - Keep it professional.
    `;

    const response = await ollama.chat({
      model: "llama3.1",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      options: { temperature: 0.2 }
    });

    const aiAnswer = response.message.content;

    // --- 3. SAVE TO DATABASE (Updated for new features) ---
    let savedChat;
    if (userId && userId !== "guest_user") {
        try {
            // We save the 'title' as the question initially
            savedChat = await Chat.create({
              userId: userId, 
              question: question,
              answer: aiAnswer,
              title: question, // <--- Added this for renaming!
              isPinned: false  // <--- Added this for pinning!
            });
            console.log("✅ SUCCESS: Chat Saved to MongoDB!"); 
        } catch (dbError) {
            console.error("❌ DATABASE ERROR: Could not save chat.", dbError);
        }
    } else {
        console.log("⚠️ WARNING: User ID is missing or guest. Chat NOT saved.");
    }

    res.json({ answer: aiAnswer, chatId: savedChat?._id });

  } catch (error) {
    console.error("❌ SERVER ERROR:", error);
    res.status(500).json({ answer: "I encountered an error." });
  }
};

// 2. GET HISTORY (Updated to Sort by Pinned)
export const getHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    console.log(`📂 Fetching History for: ${userId}`);
    
    // Sort: Pinned items first (-1), then Newest Date (-1)
    const history = await Chat.find({ userId }).sort({ isPinned: -1, timestamp: -1 });
    
    console.log(`📄 Found ${history.length} past chats.`);
    res.json(history);
  } catch (error) {
    console.error("❌ HISTORY ERROR:", error);
    res.status(500).json({ message: "Error fetching history" });
  }
};

// 3. UPDATE CHAT (Rename or Pin - NEW!)
export const updateChat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, isPinned } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (isPinned !== undefined) updateData.isPinned = isPinned;

    const updatedChat = await Chat.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedChat);
  } catch (error) {
    console.error("❌ UPDATE ERROR:", error);
    res.status(500).json({ message: "Failed to update chat" });
  }
};

// 4. DELETE CHAT (NEW!)
export const deleteChat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Chat.findByIdAndDelete(id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE ERROR:", error);
    res.status(500).json({ message: "Failed to delete chat" });
  }
};