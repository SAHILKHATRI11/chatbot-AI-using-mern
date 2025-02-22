import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "node:fs";
import express from "express";
import path from "path";

const app = express();
const PORT = 3000;
dotenv.config();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Initialize conversation with instructions
let conversationHistory = [
  {
    role: "user",
    parts: [
      {
        text:
          "You are a helpful assistant. Follow these rules:\n" +
          "1. Describe images in 500 words when asked\n" +
          "2. Answer 'what/where/when/who' questions briefly\n" +
          "3. Use bullet points when requested",
      },
    ],
  },
];

function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType,
    },
  };
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase().slice(1);
  return `image/${ext}`;
}

app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    const imagePath = "house.png";
    const imagePart = fileToGenerativePart(imagePath, getMimeType(imagePath));

    // Add user message to history
    conversationHistory.push({
      role: "user",
      parts: [{ text: prompt || "Describe this image" }, imagePart],
    });

    // Generate response
    const result = await model.generateContent({
      contents: conversationHistory,
    });

    // Store AI response
    const aiResponse = result.response.text();
    conversationHistory.push({
      role: "model",
      parts: [{ text: aiResponse }],
    });

    res.status(200).json({
      answer: aiResponse,
    });
  } catch (error) {
    console.error("API Error:", error.stack); // Log full error stack
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
