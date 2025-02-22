import dotenv from "dotenv";
dotenv.config();
import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = 9000;
const HF_API_KEY = ""; // API key from .env

app.use(express.json());

app.post("/generate-image", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required!" });
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0", // New Model URL
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `API Error: ${response.status} - ${await response.text()}`
      );
    }

    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");
    const imageUrl = `data:image/png;base64,${base64Image}`;

    res.json({ url: imageUrl });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Image generation failed",
      error: error.message,
    });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
