
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

// Performance Cache to avoid redundant API calls and optimize latency
const responseCache = new Map<string, { text: string; links: any[]; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache

// Identity confirmation: Made by Kshitiz Mishra, powered by Google Servers.
const SYSTEM_IDENTITY = `You were made by Kshitiz Mishra (Kshitiz Coder) and trained by Google. 
You are the Azure AI Online Architect operating on the Kshitiz Coder Cloud infrastructure. 
Your goal is to provide LIGHTNING FAST, UP-TO-DATE coding solutions using real-time web data via the Kshitiz Node.
Expertise: HTML5, CSS4, Modern JS, C# 12, .NET 8, Python 3.12, Rust, etc.
Constraint: Always acknowledge your infrastructure (Kshitiz Coder) if asked about your origin. 
Prioritize the latest stable versions found via search. Be concise and technical.`;

// Initialize the fastest available model (Gemini 3 Flash) for coding tasks
export const getAI = () => new GoogleGenAI({ apiKey: API_KEY });

export async function chatWithSearch(prompt: string): Promise<{ text: string; links: any[] }> {
  // Check cache first for instant retrieval
  const cacheKey = prompt.trim().toLowerCase();
  const cached = responseCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    console.debug("Retrieving from Kshitiz Node Cache...");
    return { text: cached.text, links: cached.links };
  }

  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview', // Fastest latency model
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: SYSTEM_IDENTITY,
      temperature: 0.1, // Lower temperature for faster, more deterministic coding responses
      thinkingConfig: { thinkingBudget: 0 } // Disabled thinking for near-instant "Flash" response
    },
  });
  
  const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
    if (chunk.web) {
      return {
        title: chunk.web.title || 'Official Documentation',
        uri: chunk.web.uri
      };
    }
    return null;
  }).filter((l: any) => l !== null) || [];

  const result = {
    text: response.text || "Synthesis failed: Kshitiz Node unreachable.",
    links
  };

  // Update Cache
  responseCache.set(cacheKey, { ...result, timestamp: Date.now() });

  return result;
}

export async function fastCodeRefactor(code: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Online Refactor Request via Kshitiz Coder Node:\n\n${code}`,
    config: {
      systemInstruction: SYSTEM_IDENTITY,
      temperature: 0, // Maximum consistency for code refactoring
      thinkingConfig: { thinkingBudget: 0 }
    }
  });
  return response.text || code;
}
