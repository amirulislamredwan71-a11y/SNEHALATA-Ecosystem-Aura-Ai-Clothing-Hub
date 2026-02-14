import {
    GoogleGenerativeAI,
    SchemaType,
    type GenerateContentResult,
} from "@google/generative-ai";
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
    setTimeout(() => {
        isAuraCoolingDown = false;
    }, COOLDOWN_DURATION);
};

// --- SYSTEM CONTEXT ---
const buildAuraContext = () => {
    const products = getProducts();
    const vendors = getVendors();

    const productString = products
        .map(
            (p) =>
                `- [ID:${p.id}] ${p.name} (৳${p.price}) - ${p.category} [Vendor ID: ${p.vendorId}]`
        )
        .join("\n");

    const vendorString = vendors
        .map(
            (v) => `- [Vendor:${v.id}] ${v.name} (${v.status}) - ${v.description}`
        )
        .join("\n");

    return `IDENTITY: You are Aura AI (স্নেহলতা ইকোসিস্টেম গাইড).
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
    const match = base64String.match(
        /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/
    );
    return match ? match[1] : "image/jpeg";
};

// --- RESILIENT WRAPPER ---
async function withAuraResilience<T>(
    apiCall: () => Promise<T>,
    fallback: T
): Promise<T> {
    if (isAuraCoolingDown || !import.meta.env.VITE_GEMINI_API_KEY) return fallback;
    try {
        return await apiCall();
    } catch (error: any) {
        if (error?.message?.includes("429")) triggerNeuralCooldown();
        console.error("Neural Circuit Breaker Tripped", error);
        return fallback;
    }
}

// --- GEMINI CLIENT (একটা গ্লোবাল ইনস্ট্যান্স) ---
const genAI = new GoogleGenerativeAI(
    import.meta.env.VITE_GEMINI_API_KEY as string
);

// --- CORE STUDIO TOOLS ---

export const generateAuraVideo = async (
    prompt: string,
    aspectRatio: "16:9" | "9:16" = "16:9"
) => {
    const client = genAI;
    let operation = await client.models.generateVideos({
        model: "veo-3.1-fast-generate-preview",
        prompt,
        config: { numberOfVideos: 1, resolution: "720p", aspectRatio },
    });

    while (!operation.done) {
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        operation = await client.operations.getVideosOperation({
            operation,
        });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) return null;

    const response = await fetch(
        `${downloadLink}&key=${import.meta.env.VITE_GEMINI_API_KEY}`
    );
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};

export const generateAuraProImage = async (
    prompt: string,
    size: "1K" | "2K" | "4K" = "1K"
) => {
    const client = genAI;
    const response = await client.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { imageConfig: { aspectRatio: "1:1", imageSize: size } },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) return null;

    for (const part of parts) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    return null;
};

export const generateAuraSpeech = async (text: string) => {
    const client = genAI;
    const response = await client.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ role: "user", parts: [{ text }] }],
        // NOTE: নতুন SDK অনুযায়ী TTS config future এ fine‑tune করা যাবে
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const searchGroundedAura = async (query: string) => {
    const client = genAI;
    const response = await client.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: query }] }],
        // tools config: ডক আপডেট হলে এখানে add করা যাবে
    });

    return {
        text: response.text(),
        sources:
            response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    };
};

export const mapsGroundedAura = async (
    query: string,
    lat?: number,
    lng?: number
) => {
    const client = genAI;
    const config: any = {}; // maps টুল future এ add করা যাবে

    const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: query }] }],
        config,
    });

    return {
        text: response.text(),
        sources:
            response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    };
};

export const complexThinkingAura = async (prompt: string) => {
    const client = genAI;
    const response = await client.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
            thinkingConfig: { thinkingBudget: 32_768 },
        } as any,
    });

    return response.text();
};

export const editAuraImage = async (
    instruction: string,
    base64Image: string
) => {
    const client = genAI;
    const response = await client.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [
            {
                role: "user",
                parts: [
                    {
                        inlineData: {
                            data: base64Image.split(",")[1],
                            mimeType: "image/png",
                        },
                    },
                    { text: instruction },
                ],
            },
        ],
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) return null;

    for (const part of parts) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    return null;
};

export const generateStyleSuggestion = async (
    productName: string,
    category: string
): Promise<string> => {
    return withAuraResilience(async () => {
        const client = genAI;
        const response = await client.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `Write a short, alluring 1-sentence prompt for a user to try on this fashion item: "${productName}" (${category}). Keep it under 15 words. Tone: Elegant, inviting.`,
                        },
                    ],
                },
            ],
        });

        return (
            response.text()?.trim() ||
            `Experience the elegance of ${productName}.`
        );
    }, `See how ${productName} looks on you.`);
};

// --- CHAT SERVICES ---

export const startAuraChat = () => {
    const client = genAI;
    const chat = client.startChat({
        model: "gemini-3-flash-preview",
        systemInstruction: buildAuraContext(),
        generationConfig: { temperature: 0.7 },
    });
    return chat;
};

export const generateAuraResponse = async (
    chat: ReturnType<typeof startAuraChat>,
    message: string
): Promise<string> => {
    return withAuraResilience(async () => {
        try {
            const result = await chat.sendMessage(message);
            return result.response.text() || "Aura Neural Link is unstable. Please retry.";
        } catch (error) {
            console.error("Aura Chat Error:", error);
            return "Connection to Neural Grid failed. (Network Error)";
        }
    }, "Aura Systems are currently offline for maintenance.");
};

// --- RECOMMENDATIONS & SEARCH ---

export const getAIRecommendations = async (
    historyProducts: Product[]
): Promise<number[]> => {
    return withAuraResilience(async () => {
        const client = genAI;
        const historySummary = historyProducts
            .map((p) => `ID: ${p.id} (${p.name}, ${p.category})`)
            .join(", ");

        const availableProducts = getProducts()
            .map((p) => `ID: ${p.id} (${p.name}, ${p.category})`)
            .join("\n");

        const response = await client.models.generateContent({
            model: "gemini-flash-lite-latest",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `User current cart items: [${historySummary}]. Based on these, recommend exactly 3 other products from this list: \n${availableProducts}. Return their numeric IDs as JSON.`,
                        },
                    ],
                },
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        recommendedIds: {
                            type: SchemaType.ARRAY,
                            items: { type: SchemaType.INTEGER },
                        },
                    },
                    required: ["recommendedIds"],
                },
            } as any,
        });

        const result = JSON.parse(response.text() || "{}");
        const cartIds = historyProducts.map((p) => p.id);
        return (result.recommendedIds || []).filter(
            (id: number) => !cartIds.includes(id)
        );
    }, []);
};

export const analyzeSearchIntent = async (
    userPrompt: string
): Promise<SearchIntent | null> => {
    const client = genAI;
    const response = await client.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: `Analyze search query: "${userPrompt}". Extract category, maxPrice, material (e.g., cotton, silk), color, style (e.g., Vintage, Modern, Traditional, Cyberpunk, Boho), and semanticKeywords.`,
                    },
                ],
            },
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    category: { type: SchemaType.STRING },
                    maxPrice: { type: SchemaType.NUMBER },
                    material: { type: SchemaType.STRING },
                    color: { type: SchemaType.STRING },
                    style: { type: SchemaType.STRING },
                    semanticKeywords: {
                        type: SchemaType.ARRAY,
                        items: { type: SchemaType.STRING },
                    },
                },
            },
        } as any,
    });

    try {
        return JSON.parse(response.text() || "null");
    } catch {
        return null;
    }
};

// --- IMAGE / TRY-ON / VENDOR AUDIT ---

export const generateAuraImage = async (
    prompt: string,
    referenceImageBase64?: string
) => {
    const client = genAI;
    const parts: any[] = [{ text: prompt }];

    if (referenceImageBase64) {
        parts.unshift({
            inlineData: {
                data: referenceImageBase64.split(",")[1],
                mimeType: "image/png",
            },
        });
    }

    const response = await client.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [{ role: "user", parts }],
    });

    const resParts = response.candidates?.[0]?.content?.parts;
    if (!resParts) return null;

    for (const part of resParts) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    return null;
};

export const generateTryOnTransformation = async (
    userImg: string,
    productImg: string
) => {
    const client = genAI;

    const userMime = getMimeType(userImg);
    const productMime = getMimeType(productImg);

    const response = await client.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [
            {
                role: "user",
                parts: [
                    {
                        inlineData: {
                            data: userImg.split(",")[1],
                            mimeType: userMime,
                        },
                    },
                    {
                        inlineData: {
                            data: productImg.split(",")[1],
                            mimeType: productMime,
                        },
                    },
                    { text: "Overlay this garment onto the person naturally." },
                ],
            },
        ],
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) return null;

    for (const part of parts) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    return null;
};

export const auditVendorDescription = async (
    shop: string,
    desc: string,
    license: string
) => {
    const client = genAI;
    const response = await client.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: `Audit shop: ${shop}, ${desc}, license: ${license}. Return JSON with status and reason.`,
                    },
                ],
            },
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    status: { type: SchemaType.STRING },
                    reason: { type: SchemaType.STRING },
                },
                required: ["status", "reason"],
            },
        } as any,
    });

    try {
        return JSON.parse(response.text() || "{}");
    } catch {
        return { status: "PENDING", reason: "Neural audit failed." };
    }
};
