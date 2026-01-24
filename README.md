# ⚖️ LexAI – Backend Core

Welcome to the backend of **LexAI** 🚀  
This service powers the AI logic, user verification, and secure payments to make legal information simple and accessible for everyone in Sri Lanka.

---

## 🧠 What This Backend Does

- Handles AI-powered legal chat
- Manages lawyer and admin verification
- Processes secure online payments
- Stores legal documents and user data safely

---

## 🚀 Getting Started

Follow these steps exactly to run the project on your local machine.

### 1️⃣ Install the AI Engine (Ollama)

LexAI uses **Ollama** to run AI models locally on your computer.

1. Download and install Ollama from 👉 [https://ollama.com](https://ollama.com)
2. Open your terminal and run:
```bash
ollama run llama3
```

This will download and start the Llama3 model.

---

### 2️⃣ Environment Setup

The project requires environment variables to connect to shared services.

- Request the `.env` file from the project leader
- Place the `.env` file inside the backend root folder
- This file connects the backend to the shared **LexAI_Database** on MongoDB Atlas

⚠️ **Do not upload the `.env` file to GitHub**

---

### 3️⃣ Install Dependencies

Open your terminal inside the backend folder and run:
```bash
npm install
```

---

## 📂 Project Structure
```
src/
 ├── controllers/   # Admin actions, lawyer verification, document logic
 ├── models/        # MongoDB schemas (Lawyers, LawDocuments, etc.)
 ├── services/      # AI (RAG) service connected to Ollama
 ├── routes/        # API routes used by the frontend
```

---

## 🛠️ Main Features

| Feature | Tool Used | Description |
|---------|-----------|-------------|
| AI Legal Chat | Ollama (Llama3) | Answers legal questions using local AI |
| User Authentication | Clerk | Secure login and role management |
| Payments | Stripe | Handles payments and revenue tracking |
| Database | MongoDB Atlas | Stores users, lawyers, and documents |

---

## 🗑️ Admin & Data Safety

We fixed the **"Ghost Data"** issue in the admin dashboard.

✔ **When an Admin deletes a file:**

- Data is permanently removed from the `LawDocument` collection
- Prevents `NaN` and `Invalid Date` errors
- Dashboard updates instantly (shows 0 files if empty)

**Result:** Clean database, clean UI, zero errors

---

## ⚡ How to Run the Server

After completing all setup steps, start the backend with:
```bash
npm run dev
```

The server will run on: 👉 **http://localhost:5000**

---

## 📝 Notes

- Make sure Ollama is running before starting the server
- Keep your `.env` file secure and never commit it to version control
- For issues or questions, contact the project lead

---

**Built with ❤️ for accessible legal information in Sri Lanka**
