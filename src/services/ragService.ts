import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OllamaEmbeddings } from "@langchain/ollama";
import { LawDocument } from "../models/LawDocument";
import { Ollama } from "@langchain/ollama";
import pdf from 'pdf-parse';

// 1. Setup Models (Local Ollama)
const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text", 
  baseUrl: "http://localhost:11434",
});

const chatModel = new Ollama({
  model: "gemma3:1b", 
  baseUrl: "http://localhost:11434",
  temperature: 0.1, // Keep it LOW to stop hallucinations
});

// --- FUNCTIONS ---

// 1. ADD DOCUMENT
export const addDocument = async (fileBuffer: Buffer, fileName: string) => {
  console.log(`1. Reading ${fileName} from RAM...`);
  const data = await pdf(fileBuffer);
  const fullText = data.text;

  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
  const docs = await splitter.createDocuments([fullText]);

  console.log(`3. Saving knowledge...`);
  for (const doc of docs) {
    const vector = await embeddings.embedQuery(doc.pageContent);
    await LawDocument.create({
      content: doc.pageContent,
      metadata: { source: fileName },
      embedding: vector,
    });
  }
  console.log("4. Done!");
};

// 2. SEARCH LAWS
export const searchLaws = async (query: string) => {
  console.log(`📚 Fetching Laws for: "${query}"`);
  const questionVector = await embeddings.embedQuery(query);

  const results = await LawDocument.aggregate([
    {
      "$vectorSearch": {
        "index": "vector_index", 
        "path": "embedding",
        "queryVector": questionVector,
        "numCandidates": 50,
        "limit": 3
      }
    }
  ]);
  
  return results.map(r => r.content); 
};

// 3. GENERATE AI RESPONSE (Ollama)
export const generateAIResponse = async (conversation: any[]) => {
  try {
    const formattedPrompt = conversation.map(msg => {
      const role = msg.role === 'system' ? 'SYSTEM' : (msg.role === 'user' ? 'USER' : 'ASSISTANT');
      return `${role}: ${msg.content}`;
    }).join('\n\n') + "\n\nASSISTANT:";

    console.log("🤖 Sending to Ollama...");
    const response = await chatModel.invoke(formattedPrompt);
    return response;

  } catch (error) {
    console.error("Ollama Error:", error);
    return "I am having trouble processing your request locally.";
  }
};