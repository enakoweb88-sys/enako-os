import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

export function getGeminiClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function askEnakoBot(prompt: string) {
  try {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "I was unable to synthesize a response at this time.";
  } catch (error) {
    console.error("Enako Bot Error:", error);
    return "I'm sorry, I'm experiencing some connectivity issues with the core OS layers. Please try again shortly.";
  }
}
