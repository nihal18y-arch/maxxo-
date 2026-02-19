
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Message, ModelType, Role } from "../types";

// Always use process.env.API_KEY directly during initialization
export const sendMessageToGemini = async (
  modelName: ModelType,
  history: Message[],
  currentMessage: string,
  attachments: { data: string; mimeType: string }[] = [],
  options: { 
    useThinking?: boolean; 
    useSearch?: boolean; 
    thinkingBudget?: number 
  } = {}
) => {
  // Create a new GoogleGenAI instance right before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Map history to the contents format expected by Gemini API
  const contents = history.map(msg => ({
    role: msg.role === Role.USER ? 'user' : 'model',
    parts: [
      ...(msg.attachments?.map(att => ({
        inlineData: {
          data: att.base64 || "",
          mimeType: "image/png"
        }
      })) || []),
      { text: msg.content }
    ]
  }));

  const config: any = {
    temperature: 0.7,
  };
  
  // Set thinking budget for compatible models (Gemini 2.5 and 3 series)
  if (options.useThinking) {
    config.thinkingConfig = { thinkingBudget: options.thinkingBudget || 16000 };
  }

  // Google Search tool configuration
  if (options.useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: config
    });

    // Access the .text property directly (not a method)
    const text = response.text || "No response content.";
    
    // Extract grounding URLs if Google Search was utilized
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || chunk.web?.uri || "Source",
      uri: chunk.web?.uri
    })).filter((s: any) => s.uri) || [];

    // Safely extract the reasoning/thought process from parts
    const thinkingPart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.thought);
    const thinking = thinkingPart ? (thinkingPart.text || "") : "";

    return {
      text,
      sources,
      thinking
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
