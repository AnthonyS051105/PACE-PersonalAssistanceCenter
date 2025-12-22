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
          "You are Nexus, a futuristic personal assistant for a programmer/student. You help with coding, scheduling, and summarizing notes. Keep answers concise, technical, and helpful. Use Markdown for formatting (bold, lists, headers). IMPORTANT: Only use code blocks (```) for actual programming code (JavaScript, Python, etc.) or terminal commands. Do NOT use code blocks for schedules, lists, or general text explanations. Render them as standard Markdown lists or tables.",
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

    // Check for rate limiting/quota issues
    if (
      error.status === 429 ||
      error.code === 429 ||
      (error.message && error.message.includes("429")) ||
      (error.message && error.message.includes("quota")) ||
      (error.error && error.error.code === 429)
    ) {
      return "⚠️ System Overload: Rate limit exceeded. Please wait ~30 seconds before sending another request.";
    }

    return "Error connecting to A.C.E Core. Please check your API Key configuration.";
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
    console.error("Gemini API Error:", error);
    if (
      error.status === 429 ||
      error.code === 429 ||
      (error.message && error.message.includes("429")) ||
      (error.message && error.message.includes("quota")) ||
      (error.error && error.error.code === 429)
    ) {
      return "⚠️ Rate limit exceeded. Try again later.";
    }
    return "Error generating summary.";
  }
};
