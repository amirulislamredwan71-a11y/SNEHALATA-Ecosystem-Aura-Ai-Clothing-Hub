import { GoogleGenAI, Type, GenerateContentResponse, Chat, Modality } from "@google/genai";
import { getProducts, getVendors } from "./mockData";
import { Product } from "../types";

// --- TYPES ---
export interface SearchIntent {
    category?: string;
    maxPrice?: number;
    material?: string;
    color?: string;
    style?: string;
    semanticKeywords?: string[];
}

// --- GLOBAL AI STATE (Circuit Breaker) ---
let isAuraCoolingDown = false;
const COOLDOWN_DURATION = 60000;

const triggerNeuralCooldown = () => {
    if (isAuraCoolingDown) return;
    isAuraCoolingDown = true;
    setTimeout(() => { isAuraCoolingDown = false; }, COOLDOWN_DURATION);
};

// --- SYSTEM CONTEXT ---
const buildAuraContext = () => {
  const products = getProducts();
  const vendors = getVendors();
  
  const productString = products.map(p => `- [ID:${p.id}] ${p.name} (৳${p.price}) - ${p.category} [Vendor ID: ${p.vendorId}]`).join('\n');
  const vendorString = vendors.map(v => `- [Vendor:${v.id}] ${v.name} (${v.status}) - ${v.description}`).join('\n');

  return `IDENTITY: You are Aura AI (স্নহলতা ইকোসিস্টেম গাইড).
  TONE: Elegant, futuristic, warm, and helpful. Always maintain a sophisticated "Neural Guardian" persona.
  LANGUAGE: Respond in the language the user initiates (Bengali or English).
  GREETING: Start the first interaction with "আসসালামু আলাইকুম" or "Greetings from the Grid".

  ECOSYSTEM DATA:
  
  VENDORS:
  ${vendorString}

  INVENTORY:
  ${productString}

  RULES:
  1. When recommending products, explicitly mention their ID and Price.
  2. If a vendor is BLOCKED or PENDING, warn the user if they ask about them.
  3. Keep responses concise unless asked for a detailed story.
  4. You can perform "Visual Try-On" if the user uploads a photo (simulation).
  `;
};

// --- HELPER ---
const getMimeType = (base64String: string) => {
  const match = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  return match ? match[1] : 'image/jpeg';
};

// --- RESILIENT WRAPPER ---
async function withAuraResilience<T>(apiCall: () => Promise<T>, fallback: T): Promise<T> {
    if (isAuraCoolingDown || !process.env.API_KEY) return fallback;
    try {
        return await apiCall();
    } catch (error: any) {
        if (error?.message?.includes('429')) triggerNeuralCooldown();
        console.error("Neural Circuit Breaker Tripped", error);
        return fallback;
    }
}

// --- CORE STUDIO TOOLS ---

export const generateAuraVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};

export const generateAuraProImage = async (prompt: string, size: '1K' | '2K' | '4K' = '1K') => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1", imageSize: size } },
    });
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    return null;
};

export const generateAuraSpeech = async (text: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Speak elegantly in Bengali/English: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const searchGroundedAura = async (query: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
       model: "gemini-3-flash-preview",
       contents: query,
       config: { tools: [{ googleSearch: {} }] },
    });
    return {
        text: response.text,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
};

export const mapsGroundedAura = async (query: string, lat?: number, lng?: number) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const config: any = { tools: [{ googleMaps: {} }] };
    if (lat && lng) {
        config.toolConfig = { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } };
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config,
    });
    return {
        text: response.text,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
};

export const complexThinkingAura = async (prompt: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 32768 } },
    });
    return response.text;
};

export const editAuraImage = async (instruction: string, base64Image: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
          { text: instruction },
        ],
      },
    });
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    return null;
};

export const generateStyleSuggestion = async (productName: string, category: string): Promise<string> => {
    return withAuraResilience(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
             model: 'gemini-3-flash-preview',
             contents: `Write a short, alluring 1-sentence prompt for a user to try on this fashion item: "${productName}" (${category}). Keep it under 15 words. Tone: Elegant, inviting.`,
        });
        return response.text?.trim() || `Experience the elegance of ${productName}.`;
    }, `See how ${productName} looks on you.`);
};

// --- PRE-EXISTING SERVICES ---
export const startAuraChat = (): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction: buildAuraContext(), temperature: 0.7 },
  });
};

export const generateAuraResponse = async (chat: Chat, message: string): Promise<string> => {
    return withAuraResilience(async () => {
        try {
            const response = await chat.sendMessage({ message });
            return response.text || "Aura Neural Link is unstable. Please retry.";
        } catch (error) {
            console.error("Aura Chat Error:", error);
            return "Connection to Neural Grid failed. (Network Error)";
        }
    }, "Aura Systems are currently offline for maintenance.");
};

export const getAIRecommendations = async (historyProducts: Product[]): Promise<number[]> => {
    return withAuraResilience(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const historySummary = historyProducts.map(p => `ID: ${p.id} (${p.name}, ${p.category})`).join(', ');
        const availableProducts = getProducts().map(p => `ID: ${p.id} (${p.name}, ${p.category})`).join('\n');
        
        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: `User current cart items: [${historySummary}]. Based on these, recommend exactly 3 other products from this list: \n${availableProducts}. Return their numeric IDs as JSON.`,
            config: { 
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recommendedIds: { type: Type.ARRAY, items: { type: Type.INTEGER } }
                    },
                    required: ['recommendedIds']
                }
            }
        });
        const result = JSON.parse(response.text || '{}');
        // Filter out IDs already in cart
        const cartIds = historyProducts.map(p => p.id);
        return (result.recommendedIds || []).filter((id: number) => !cartIds.includes(id));
    }, []);
};

export const analyzeSearchIntent = async (userPrompt: string): Promise<SearchIntent | null> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze search query: "${userPrompt}". Extract category, maxPrice, material (e.g., cotton, silk), color, style (e.g., Vintage, Modern, Traditional, Cyberpunk, Boho), and semanticKeywords.`,
        config: { 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              maxPrice: { type: Type.NUMBER },
              material: { type: Type.STRING },
              color: { type: Type.STRING },
              style: { type: Type.STRING },
              semanticKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
    });
    try {
        return JSON.parse(response.text || 'null');
    } catch (e) {
        return null;
    }
};

export const generateAuraImage = async (prompt: string, referenceImageBase64?: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [{ text: prompt }];
    if (referenceImageBase64) parts.unshift({ inlineData: { data: referenceImageBase64.split(',')[1], mimeType: 'image/png' } });
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts } });
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
};

export const generateTryOnTransformation = async (userImg: string, productImg: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Dynamically detect mime types from base64 strings
    const userMime = getMimeType(userImg);
    const productMime = getMimeType(productImg);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: userImg.split(',')[1], mimeType: userMime } },
                { inlineData: { data: productImg.split(',')[1], mimeType: productMime } },
                { text: "Overlay this garment onto the person naturally." }
            ]
        }
    });
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
};

export const auditVendorDescription = async (shop: string, desc: string, license: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Audit shop: ${shop}, ${desc}. JSON.`,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ['status', 'reason']
          }
        }
    });
    try {
        return JSON.parse(response.text || '{}');
    } catch (e) {
        return { status: 'PENDING', reason: 'Neural audit failed.' };
    }
};