import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OllamaEmbeddings } from "@langchain/ollama";
import { LawDocument } from "../models/LawDocument";

// 1. Setup Ollama
const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text", 
  baseUrl: "http://localhost:11434",
});

// 2. Export the Service Object (The Fix!)
export const ragService = {
  
  // We rename 'processDocument' to 'addDocument' to match your Controller
  addDocument: async (filePath: string) => {
    console.log("1. Loading PDF...");
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    console.log("2. Splitting text into chunks...");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });
    const chunks = await splitter.splitDocuments(docs);

    console.log(`3. Converting ${chunks.length} chunks into vectors...`);
    
    for (const chunk of chunks) {
      const vector = await embeddings.embedQuery(chunk.pageContent);

      await LawDocument.create({
        content: chunk.pageContent,
        metadata: chunk.metadata,
        embedding: vector,
      });
    }

    console.log("4. Done! Document saved.");
  }
};