import { GoogleGenerativeAI } from "@google/generative-ai";

// Note: You might need to install @google/generative-ai if @google/genai is different
// npm install @google/generative-ai

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({ model: "gemini-pro" });
