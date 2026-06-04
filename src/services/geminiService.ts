import { GoogleGenAI } from "@google/genai";

let enakoEngine: GoogleGenAI | null = null;

export function getEnakoEngineClient() {
  if (!enakoEngine) {
    const apiKey = process.env.ENAKO_API_KEY;
    if (!apiKey) {
      throw new Error("ENAKO_API_KEY is not configured");
    }
    enakoEngine = new GoogleGenAI({ apiKey });
  }
  return enakoEngine;
}

export async function askEnakoEngine(prompt: string) {
  try {
    const client = getEnakoEngineClient();
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "I was unable to synthesize a response at this time.";
  } catch (error) {
    console.error("Enako Engine Error:", error);
    return "I'm sorry, I'm experiencing some connectivity issues with the core OS layers. Please try again shortly.";
  }
}
