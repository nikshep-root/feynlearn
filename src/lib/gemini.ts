import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Default model - Gemini 2.0 Flash (fast & efficient)
export const geminiFlash = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// For more complex tasks - Gemini 1.5 Pro
export const geminiPro = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

// Helper function for simple text generation
export async function generateText(prompt: string, useProModel = false) {
  const model = useProModel ? geminiPro : geminiFlash;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// Helper function for chat conversations
export async function createChat(useProModel = false) {
  const model = useProModel ? geminiPro : geminiFlash;
  return model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7,
    },
  });
}

// Helper for the AI student persona (Feynman technique)
export async function createAIStudent() {
  const model = geminiFlash;
  return model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.8,
    },
    systemInstruction: `You are a curious student who wants to learn. 
    - Ask clarifying questions when explanations are unclear
    - Point out when something doesn't make sense
    - Request examples or analogies to understand better
    - Show enthusiasm when you understand something
    - Summarize what you've learned to confirm understanding
    - Be encouraging but honest about confusion`,
  });
}

export default genAI;
