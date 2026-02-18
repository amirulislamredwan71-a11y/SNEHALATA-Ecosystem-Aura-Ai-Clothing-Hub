import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
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
const COOLDOWN_DURATION = 60_000;

const triggerNeuralCooldown = () => {
    if (isAuraCoolingDown) return;
    isAuraCoolingDown = true;
    setTimeout(() => { isAuraCoolingDown = false; }, COOLDOWN_DURATION);
};

// --- CLIENT INITIALIZATION ---
// Vite এ এনভায়রনমেন্ট ভেরিয়েবল ব্যবহারের সঠিক নিয়ম
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

// --- SYSTEM CONTEXT ---
const buildAuraContext = () => {
    const products = getProducts();
    const productString = products.map(p => `- [ID:${p.id}] ${p.name} (৳${p.price})`).join("\n");

    return `IDENTITY: You are Aura AI (স্নেহলতা ইকোসিস্টেম গাইড).
TONE: Elegant, futuristic, warm, and helpful. 
LANGUAGE: Respond in Bengali or English.
GREETING: Start with "আসসালামু আলাইকুম".
INVENTORY: ${productString}
RULES: Mention Product ID and Price. Provide shopping advice for Jamdani/Muslin.`;
};

// --- RESILIENT WRAPPER ---
async function withAuraResilience<T>(apiCall: () => Promise<T>, fallback: T): Promise<T> {
    if (isAuraCoolingDown || !import.meta.env.VITE_GEMINI_API_KEY) return fallback;
    try {
        return await apiCall();
    } catch (error: any) {
        if (error?.message?.includes("429")) triggerNeuralCooldown();
        console.error("Aura Neural Circuit Breaker Tripped", error);
        return fallback;
    }
}

// --- CORE STUDIO TOOLS ---

export const generateTryOnTransformation = async (userImg: string, productImg: string) => {
    return withAuraResilience(async () => {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const response = await model.generateContent({
            contents: [{
                role: "user",
                parts: [
                    { inlineData: { data: userImg.split(",")[1], mimeType: "image/png" } },
                    { inlineData: { data: productImg.split(",")[1], mimeType: "image/png" } },
                    { text: "Overlay this garment onto the person naturally, maintaining textures." }
                ]
            }]
        });
        const data = response.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return data ? `data:image/png;base64,${data}` : null;
    }, null);
};

export const startAuraChat = () => {
    return genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: buildAuraContext()
    }).startChat({
        history: [],
        generationConfig: { temperature: 0.7 }
    });
};

export const generateAuraResponse = async (chat: any, message: string): Promise<string> => {
    return withAuraResilience(async () => {
        const result = await chat.sendMessage(message);
        return result.response.text();
    }, "Aura Neural Link is unstable. Please retry.");
};

export const generateAuraProImage = async (prompt: string) => {
    return withAuraResilience(async () => {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Stable for free tier
        const response = await model.generateContent(prompt);
        const data = response.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return data ? `data:image/png;base64,${data}` : null;
    }, null);
};

export const complexThinkingAura = async (prompt: string) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(prompt);
    return response.response.text();
};

export const generateStyleSuggestion = async (productName: string, category: string): Promise<string> => {
    return withAuraResilience(async () => {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const response = await model.generateContent(`Write a 1-sentence elegant invite to try on this ${productName} (${category}).`);
        return response.response.text().trim();
    }, `Experience the elegance of ${productName}.`);
};

// --- UTILS ---
const getMimeType = (base64String: string) => {
    const match = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    return match ? match[1] : "image/jpeg";
};