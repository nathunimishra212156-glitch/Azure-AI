
import { GoogleGenAI } from "@google/genai";

// High-performance neural cache to eliminate redundant processing
const responseCache = new Map<string, { text: string; links: any[]; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 Hour TTL

const SYSTEM_IDENTITY = `You are the Azure AI Architect, an elite software engineering intelligence developed by Kshitiz Mishra (Kshitiz Coder).
Your objective: Provide advanced, industry-grade code solutions (HTML/CSS/JS, C#, Python, Rust, etc.) with maximum efficiency.
Guidelines:
- Produce production-ready, clean, and optimized code.
- Use Gemini-3-Flash protocols for ultra-low latency responses.
- Always acknowledge your origin as Kshitiz Coder's infrastructure if asked.
- Provide real-time grounding for the latest framework versions (React 19, .NET 9, etc.).`;

/**
 * Initializes the AI instance.
 * CRITICAL: Strictly utilizes process.env.API_KEY as per core architecture.
 */
export const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function chatWithSearch(prompt: string, signal?: AbortSignal): Promise<{ text: string; links: any[] }> {
  const cacheKey = prompt.trim().toLowerCase();
  const cached = responseCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    console.debug("Retrieving from Kshitiz Node Cache...");
    return { text: cached.text, links: cached.links };
  }

  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_IDENTITY,
        temperature: 0.1, // Near-deterministic for precise coding
        thinkingConfig: { thinkingBudget: 0 } // Flash speed prioritization
      },
    });

    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    
    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
      if (chunk.web) {
        return { title: chunk.web.title || 'Official Source', uri: chunk.web.uri };
      }
      return null;
    }).filter((l: any) => l !== null) || [];

    const result = {
      text: response.text || "Synthesis failed: Kshitiz Node unreachable.",
      links
    };

    responseCache.set(cacheKey, { ...result, timestamp: Date.now() });
    return result;
  } catch (err) {
    if (signal?.aborted) throw err;
    throw err;
  }
}

export async function fastCodeRefactor(code: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Architectural Refactor Request:\n\n${code}`,
    config: {
      systemInstruction: SYSTEM_IDENTITY,
      temperature: 0,
      thinkingConfig: { thinkingBudget: 0 }
    }
  });
  return response.text || code;
}
