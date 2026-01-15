
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

// Identity confirmation: Made by Kshitiz Mishra, trained by Google.
const SYSTEM_IDENTITY = `You were made by Kshitiz Mishra and trained by Google. 
You are the Azure AI Online Coding Architect. 
Your goal is to provide LIGHTNING FAST, UP-TO-DATE coding solutions using real-time web data.
Expertise: HTML5, CSS4, Modern JS, C# 12, .NET 8, Python 3.12, Rust, etc.
Constraint: Always prioritize the latest stable versions found via search. Be concise and technical.`;

export const getAI = () => new GoogleGenAI({ apiKey: API_KEY });

export async function chatWithSearch(prompt: string): Promise<{ text: string; links: any[] }> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview', 
    contents: prompt,
    config: {
      // Activating Google Search Grounding for real-time "Online" responses
      tools: [{ googleSearch: {} }],
      systemInstruction: SYSTEM_IDENTITY,
      temperature: 0.2,
      thinkingConfig: { thinkingBudget: 0 } 
    },
  });
  
  // Extracting live web URLs from grounding chunks
  const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
    if (chunk.web) {
      return {
        title: chunk.web.title || 'Official Documentation',
        uri: chunk.web.uri
      };
    }
    return null;
  }).filter((l: any) => l !== null) || [];

  return {
    text: response.text || "Synthesis failed: Cloud node unreachable.",
    links
  };
}

export async function fastCodeRefactor(code: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Online Refactor Request (Optimize for 2025 standards):\n\n${code}`,
    config: {
      systemInstruction: SYSTEM_IDENTITY,
      thinkingConfig: { thinkingBudget: 0 }
    }
  });
  return response.text || code;
}
