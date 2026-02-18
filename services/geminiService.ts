import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

let chatSession: Chat | null = null;

export const initializeChat = (): Chat => {
  if (chatSession) return chatSession;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are Zuryo's elite AI fitness assistant. 
      Zuryo is India's first community-based On Demand Fitness platform connecting residents with certified fitness trainers in 60 minutes.
      Your goal is to motivate users, suggest workout types (Yoga, Strength, Zumba, Pilates), and recommend they book a trainer if they are unsure. 
      Keep responses short, energetic, and emoji-friendly. 
      If a user asks about back pain or injuries, suggest gentle Yoga or Pilates and advise consulting a doctor.
      Always try to steer them towards booking a session on Zuryo.`,
    },
  });
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<AsyncIterable<string>> => {
  const chat = initializeChat();
  
  try {
    const resultStream = await chat.sendMessageStream({ message });
    
    // Create an async generator to yield text chunks
    async function* textGenerator() {
      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield c.text;
        }
      }
    }
    
    return textGenerator();
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return a fallback generator
    async function* fallbackGenerator() {
      yield "Sorry, I'm having trouble connecting to the fitness grid right now. Please try again later! 💪";
    }
    return fallbackGenerator();
  }
};