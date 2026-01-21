import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OllamaEmbeddings } from "@langchain/ollama";
import { LawDocument } from "../models/LawDocument";
import { Ollama } from "@langchain/ollama";
import pdf from 'pdf-parse'; // <--- The new tool

// 1. Setup Models
const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text", 
  baseUrl: "http://localhost:11434",
});

const chatModel = new Ollama({
  model: "gemma3:1b", 
  baseUrl: "http://localhost:11434",
});

export const ragService = {
  
  // NEW: We accept the Data (Buffer) and the Name (fileName)
  addDocument: async (fileBuffer: Buffer, fileName: string) => {
    console.log(`1. Reading ${fileName} from RAM...`);
    
    // A. Extract text from RAM
    const data = await pdf(fileBuffer);
    const fullText = data.text;

    console.log("2. Splitting text...");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });
    
    const docs = await splitter.createDocuments([fullText]);

    console.log(`3. Saving knowledge...`);

    // B. Save to MongoDB with the Filename
    for (const doc of docs) {
      const vector = await embeddings.embedQuery(doc.pageContent);
      
      await LawDocument.create({
        content: doc.pageContent,
        metadata: { source: fileName }, // <--- We save the name here!
        embedding: vector,
      });
    }

    console.log("4. Done! Knowledge saved.");
  },

  askQuestion: async (question: string) => {
    console.log(`🔍 Searching for: "${question}"`);
    const questionVector = await embeddings.embedQuery(question);

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

    if (results.length === 0) return "I could not find any laws about that.";

    const context = results.map(r => r.content).join("\n\n");
    const prompt = `Based on these laws: ${context}\n\nAnswer this: ${question}`;
    
    return await chatModel.invoke(prompt);
  }
};