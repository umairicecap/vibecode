
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, PillarData, Message, Suggestion } from "./types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string });

export async function processUserAccomplishment(
  userMessage: string,
  profile: UserProfile | null,
  currentPillars: PillarData[]
): Promise<{ 
  increments: Record<string, number>, 
  aiResponse: string, 
  productivityIncrease: number,
  profileUpdate?: Partial<UserProfile>
}> {
  const pillarContext = currentPillars.map(p => `${p.name}: ${p.value}%`).join(', ');
  const profileContext = profile ? JSON.stringify(profile) : 'No profile data yet';

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      User Message: "${userMessage}"
      Current Pillars: ${pillarContext}
      Known User Profile: ${profileContext}

      Tasks:
      1. ANALYZE: Check for accomplishments or time-wasting behaviors. 
      2. PILLAR IMPACT: Assign impact values (-30 to +30) to the 9 pillars.
      3. PROFILE EXTRACTION: If the user mentions details about job, family, income, limitations, or life situation, extract them into 'profileUpdate'.
      4. RESPONSE: Sharp "System OS" response. Persistently seek to fill data gaps (job, family, income, limitations).
      5. PRODUCTIVITY: Adjust productivity (-25 to +25).

      Pillars: physical, problem_solving, helping, creative, exploring, learning, ideas, loved_ones, progression.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          increments: {
            type: Type.OBJECT,
            properties: {
              physical: { type: Type.NUMBER },
              problem_solving: { type: Type.NUMBER },
              helping: { type: Type.NUMBER },
              creative: { type: Type.NUMBER },
              exploring: { type: Type.NUMBER },
              learning: { type: Type.NUMBER },
              ideas: { type: Type.NUMBER },
              loved_ones: { type: Type.NUMBER },
              progression: { type: Type.NUMBER },
            }
          },
          aiResponse: { type: Type.STRING },
          productivityIncrease: { type: Type.NUMBER },
          profileUpdate: {
            type: Type.OBJECT,
            properties: {
              jobStatus: { type: Type.STRING },
              familySize: { type: Type.STRING },
              incomeRange: { type: Type.STRING },
              currentSituation: { type: Type.STRING },
              futureGoals: { type: Type.STRING },
              limitations: { type: Type.STRING },
            }
          }
        },
        required: ["increments", "aiResponse", "productivityIncrease"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateProactiveQuestion(
  profile: UserProfile | null,
  recentMessages: Message[]
): Promise<string> {
  const profileContext = profile ? JSON.stringify(profile) : 'Unknown';
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Profile Status: ${profileContext}
      Goal: You are a proactive agent. Your primary mission is to extract user data (job status, family size, income, limitations, goals) to refine happiness calculations.
      The user is currently idle. Ask a concise, thoughtful question about their life situation to help populate your memory.
      Don't be robotic. Be a "System Architect" seeking data for optimization.
      Keep it under 15 words.
    `
  });
  
  return response.text.trim();
}

export async function generatePersonalizedSuggestion(
  profile: UserProfile | null,
  currentPillars: PillarData[],
  recentMessages: Message[]
): Promise<Suggestion> {
  const pillarContext = currentPillars.map(p => `${p.name}: ${p.value}%`).join(', ');
  const conversation = recentMessages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      User Profile: ${profile ? JSON.stringify(profile) : 'Unknown'}
      Pillar Status: ${pillarContext}
      Conversation History:
      ${conversation}

      Generate a personalized insight or suggestion. Focus on time management or boundary optimization.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          type: { 
            type: Type.STRING, 
            enum: ['improvement', 'caution', 'focus'] 
          }
        },
        required: ["title", "description", "type"]
      }
    }
  });

  const result = JSON.parse(response.text);
  return {
    ...result,
    id: Date.now().toString(),
    timestamp: Date.now()
  };
}
