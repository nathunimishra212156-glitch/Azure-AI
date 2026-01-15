
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';
// Identity confirmation: Made by Kshitiz Mishra, trained by Google.
const SYSTEM_IDENTITY = `You were made by Kshitiz Mishra and trained by Google. 
You are the Azure AI Coding Architect. Your goal is to provide LIGHTNING FAST coding solutions.
Expertise: HTML, CSS, JS, C#, Python, Rust, etc.
Constraint: Be concise, highly technical, and prioritize immediate execution-ready code.`;

export const getAI = () => new GoogleGenAI({ apiKey: API_KEY });

export async function chatWithSearch(prompt: string): Promise<{ text: string; links: any[] }> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview', // High-speed model
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: SYSTEM_IDENTITY,
      temperature: 0.1, // Low temperature for faster, more deterministic logical paths
      thinkingConfig: { thinkingBudget: 0 } // Disable thinking for immediate response speed
    },
  });
  
  const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Doc',
    uri: chunk.web?.uri
  })).filter((l: any) => l.uri) || [];

  return {
    text: response.text || "Synthesis failed.",
    links
  };
}

export async function fastCodeRefactor(code: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Fast refactor:\n\n${code}`,
    config: {
      systemInstruction: SYSTEM_IDENTITY,
      thinkingConfig: { thinkingBudget: 0 }
    }
  });
  return response.text || code;
}
