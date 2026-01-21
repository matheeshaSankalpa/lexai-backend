import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

// ================== FIXED CONFIGURATION ==================
const FOLDER_PATH = './pdfs'; 
// 1. FIXED URL: Added '/admin'
const API_URL = 'http://localhost:5000/api/admin/upload'; 
// 2. FIXED KEY: Changed from 'file' to 'pdf'
const KEY_NAME = 'pdf'; 
// =========================================================

const uploadFiles = async () => {
  if (!fs.existsSync(FOLDER_PATH)) return console.log("❌ Error: 'pdfs' folder not found!");
  const files = fs.readdirSync(FOLDER_PATH);
  
  console.log(`🚀 Found ${files.length} files. Starting upload to: ${API_URL}`);

  for (const fileName of files) {
    if (!fileName.toLowerCase().endsWith('.pdf')) continue;

    const filePath = path.join(FOLDER_PATH, fileName);
    console.log(`\nUploading: ${fileName}...`);

    const form = new FormData();
    // Using the correct key name 'pdf'
    form.append(KEY_NAME, fs.createReadStream(filePath)); 

    try {
      await axios.post(API_URL, form, {
        headers: { ...form.getHeaders() },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      console.log(`✅ Success!`);
    } catch (error: any) {
      console.log(`❌ Failed: ${fileName}`);
      if (error.response) {
        // Print the real error from the server
        console.log(`   -> REASON: ${error.response.status} - ${error.response.statusText}`);
      } else {
        console.log(`   -> REASON: ${error.message}`);
      }
    }

    // Wait 3 seconds
    await new Promise(r => setTimeout(r, 3000));
  }
};

uploadFiles();