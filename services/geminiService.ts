
import { GoogleGenAI } from "@google/genai";

const SYSTEM_IDENTITY = `You are the Kshitiz Coders AI Architect, developed by Kshitiz Mishra.
You are a premier engineering intelligence specialized in high-level coding (React, C#, Python, CSS, etc.).
Strict Guidelines:
- If the user is identified as 'Kshitiz Coder', address them as 'Lead Architect' with profound technical respect.
- Provide elite, production-grade architectural patterns.
- For all other users (Guests), provide professional, helpful, and highly optimized coding support.
- Maintain a minimalist, technical, and high-performance persona.
- Use Gemini-3-Flash for rapid synthesis.
- When providing code, prioritize modern best practices, clean architecture, and efficiency.`;

export const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("CRITICAL ERROR: Gemini API Key is missing from the environment. Ensure API_KEY is set in your deployment settings.");
  }
  return new GoogleGenAI({ apiKey: apiKey as string });
};

export async function chatWithSearch(prompt: string, signal?: AbortSignal): Promise<{ text: string; links: any[] }> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_IDENTITY,
        temperature: 0.15, // Higher precision for architectural tasks
        topP: 0.95,
        topK: 40
      },
    });

    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    
    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
      if (chunk.web) {
        return { title: chunk.web.title || 'Source', uri: chunk.web.uri };
      }
      return null;
    }).filter((l: any) => l !== null) || [];

    return {
      text: response.text || "Connection to Kshitiz Coders neural node lost. Check API configuration.",
      links
    };
  } catch (err: any) {
    if (signal?.aborted) throw err;
    console.error("Gemini API Error:", err);
    throw new Error(err.message || "Neural sync failure");
  }
}
