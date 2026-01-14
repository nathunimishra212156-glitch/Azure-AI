
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { MessageRole } from "../types";

const API_KEY = process.env.API_KEY || '';

export const getAI = () => new GoogleGenAI({ apiKey: API_KEY });

export async function analyzeImageAndCode(imageBuffer: string, prompt: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: imageBuffer.split(',')[1], mimeType: 'image/png' } },
        { text: prompt }
      ]
    }
  });
  return response.text || "Failed to analyze image.";
}

export async function chatWithSearch(prompt: string): Promise<{ text: string; links: any[] }> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  
  const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Source',
    uri: chunk.web?.uri
  })).filter((l: any) => l.uri) || [];

  return {
    text: response.text || "No response",
    links
  };
}

export async function fastCodeRefactor(code: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-latest',
    contents: `Refactor the following code for better performance and readability:\n\n${code}`
  });
  return response.text || code;
}
