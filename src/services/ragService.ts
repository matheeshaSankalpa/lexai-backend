import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OllamaEmbeddings } from "@langchain/ollama";
import { LawDocument } from "../models/LawDocument";
import { Ollama } from "@langchain/ollama";

// 1. Setup the Embedding Model (The Reader)
const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text", 
  baseUrl: "http://localhost:11434",
});

// 2. Setup the Chat Model (The Speaker)
// We are using 'gemma3:1b' because that is what you have installed!
const chatModel = new Ollama({
  model: "gemma3:1b", 
  baseUrl: "http://localhost:11434",
});

export const ragService = {
  
  // FUNCTION A: Upload and Save (This works already)
  addDocument: async (filePath: string) => {
    console.log("1. Loading PDF...");
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    console.log("2. Splitting text...");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });
    const chunks = await splitter.splitDocuments(docs);

    console.log(`3. Saving ${chunks.length} chunks...`);
    for (const chunk of chunks) {
      const vector = await embeddings.embedQuery(chunk.pageContent);
      await LawDocument.create({
        content: chunk.pageContent,
        metadata: chunk.metadata,
        embedding: vector,
      });
    }
    console.log("4. Done! Document saved.");
  },

  // FUNCTION B: Ask a Question (This is the NEW part you were missing)
  askQuestion: async (question: string) => {
    console.log(`🔍 Searching for: "${question}"`);

    // 1. Convert user's question to a Vector
    const questionVector = await embeddings.embedQuery(question);

    // 2. Search MongoDB for the best matching law
    // (Make sure you created the 'vector_index' on MongoDB Atlas website!)
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

    if (results.length === 0) {
      return "I could not find any laws about that in the uploaded documents.";
    }

    // 3. Combine the found laws into a single text
    const context = results.map(r => r.content).join("\n\n");

    // 4. Send everything to Gemma to explain it
    console.log("🤖 Asking Gemma...");
    const prompt = `
      You are a Sri Lankan Legal AI. Use the following laws to answer the question.
      If the answer is not in the laws, say "I don't know".
      
      LAWS:
      ${context}

      QUESTION:
      ${question}
      
      ANSWER (Simple English):
    `;

    const answer = await chatModel.invoke(prompt);
    return answer;
  }
};