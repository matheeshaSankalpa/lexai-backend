import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OllamaEmbeddings } from "@langchain/ollama";
import { LawDocument } from "../models/LawDocument";

// 1. Setup Ollama (The AI that turns text into numbers)
const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text", // Fast model for embeddings
  baseUrl: "http://localhost:11434",
});

export const processDocument = async (filePath: string) => {
  console.log("1. Loading PDF...");
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();

  console.log("2. Splitting text into chunks...");
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500, // Size of each piece
    chunkOverlap: 50, // Slight overlap so context isn't lost
  });
  const chunks = await splitter.splitDocuments(docs);

  console.log(`3. Converting ${chunks.length} chunks into vectors...`);
  
  // Loop through every chunk and save it to MongoDB
  for (const chunk of chunks) {
    // A. Ask Ollama for the numbers (Vector)
    const vector = await embeddings.embedQuery(chunk.pageContent);

    // B. Create the Database Record
    await LawDocument.create({
      content: chunk.pageContent,
      metadata: chunk.metadata,
      embedding: vector,
    });
  }

  console.log("4. Done! Document saved.");
};