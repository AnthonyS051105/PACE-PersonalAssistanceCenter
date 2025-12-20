import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// NOTE: For the live environment, user provided key is mocked here conceptually
// but strictly following instructions we use process.env.API_KEY.
// The user should ensure this is set in their build environment.
const apiKey =
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_API_KEY ||
  process.env.API_KEY;
if (!apiKey) {
  console.warn("Gemini API Key is missing. AI features will not work.");
}
const ai = new GoogleGenAI({ apiKey: apiKey || "dummy-key" }); // Prevent crash on init, will fail on call

export const generateAIResponse = async (prompt, history = []) => {
  try {
    const model = "gemini-2.5-flash";

    // Construct a chat-like history if needed, or just send prompt for single turn
    // For this implementation, we will use a chat session for context.

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction:
          "You are Nexus, a futuristic personal assistant for a programmer/student. You help with coding, scheduling, and summarizing notes. Keep answers concise, technical, and helpful. You can use Markdown.",
      },
      history: history.map((h) => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
    });

    const result = await chat.sendMessage({ message: prompt });
    return result.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to Nexus AI Core. Please check your API Key configuration.";
  }
};

export const summarizeNotes = async (noteContent) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Summarize the following notes into bullet points:\n\n${noteContent}`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Summary Error", error);
    return "";
  }
};
