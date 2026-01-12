import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  buildSystemPrompt,
  getDynamicUserContext,
  parseAIResponse,
} from "../config/ai.context";
import { AIRequest, AIResponse } from "../types/ai.type";
import { Logger } from "../utils/logger.util";

/**
 * AI Service using Google Gemini (Singleton Pattern)
 * NO hardcoded data - fully dynamic with online search capability
 */
export class AIService {
  private static instance: AIService;
  private genAI: GoogleGenerativeAI;
  private model: any;

  private constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-pro for better reasoning and search capability
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        temperature: 0.7, // Balanced creativity and accuracy
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Main AI chat function with dynamic context
   */
  async chat(request: AIRequest): Promise<AIResponse> {
    try {
      const { message, context } = request;

      // Get dynamic user context (preferences, city, trip count)
      const userContext = await getDynamicUserContext(context?.userId);

      // Build fully dynamic context
      const additionalContext = {
        ...context,
        ...userContext,
        timeOfDay: this.getTimeOfDay(),
        dayOfWeek: this.getDayOfWeek(),
      };

      // Build system prompt (NO hardcoded prices/distances)
      const systemPrompt = buildSystemPrompt(additionalContext);

      const fullPrompt = `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;

      // Logger.log("🤖 AI Request:", { message, context: additionalContext });

      // Call Gemini API
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const aiReply = response.text();

      // Logger.log("🤖 AI Response:", aiReply);

      // Parse AI response for actions
      const parsedResponse = parseAIResponse(aiReply, message);

      return {
        reply: aiReply,
        action: parsedResponse.action,
        actionData: parsedResponse.actionData,
      };
    } catch (error: any) {
      Logger.error("❌ AI Service Error:", error);

      // Enhanced error handling
      if (error.message?.includes("API key")) {
        return {
          reply:
            "There's an issue with the AI service configuration. Please contact support.",
          action: "none",
        };
      }

      if (error.message?.includes("quota")) {
        return {
          reply:
            "The AI service is temporarily at capacity. Please try again in a moment.",
          action: "none",
        };
      }

      // Generic fallback
      return {
        reply:
          "I'm having trouble right now, but I'm still here to help! You can:\n\n1. Search for routes using the search feature\n2. Check your trip history\n3. Update your preferences\n\nWhat would you like to do?",
        action: "none",
      };
    }
  }

  /**
   * Smart recommendation with NO hardcoded data
   */
  async getSmartRecommendation(
    userId: string,
    query: string
  ): Promise<AIResponse> {
    try {
      const { prisma } = await import("../config/database");

      // Get user preferences
      const preferences = await prisma.userPreference.findUnique({
        where: { userId },
        cacheStrategy: { ttl: 60, swr: 30 },
      });

      // Get recent trips (only origin/destination, not prices)
      const recentTrips = await prisma.trip.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          origin: true,
          destination: true,
          transportMode: true,
          createdAt: true,
        },
      });

      const contextPrompt = `
You are WayFinder AI assisting a user with personalized recommendations.

USER PREFERENCES:
- Max Budget: ${preferences?.maxBudget || "Not set"} XAF
- Preferred Modes: ${preferences?.preferredModes?.join(", ") || "No preference"}
- Priority: ${preferences?.priorityType || "balanced"}
- Avoidance Zones: ${preferences?.avoidanceZones?.join(", ") || "None"}

RECENT TRIP PATTERNS:
${
  recentTrips.length > 0
    ? recentTrips
        .map(
          (t: {
            origin: string;
            destination: string;
            transportMode: string;
            createdAt: Date;
          }) => `- ${t.origin} → ${t.destination} (${t.transportMode})`
        )
        .join("\n")
    : "No recent trips yet"
}

USER QUERY: ${query}

INSTRUCTIONS:
1. Provide a helpful recommendation based on their preferences and patterns
2. DO NOT provide specific prices (they change frequently)
3. If recommending a route, format as: ROUTE: [origin] to [destination]
4. Encourage them to use the route search for current prices
5. Be personalized based on their history

Respond in a friendly, concise manner (3-4 sentences).
      `;

      const result = await this.model.generateContent(contextPrompt);
      const aiReply = await result.response.text();

      return parseAIResponse(aiReply, query);
    } catch (error: any) {
      Logger.error("❌ Smart Recommendation Error:", error);
      return {
        reply:
          "I couldn't generate a personalized recommendation right now. Try using the route search feature to explore options based on your preferences!",
        action: "none",
      };
    }
  }

  /**
   * Generate travel tips (general, no hardcoded data)
   */
  async getTravelTips(conditions: {
    weather?: string;
    timeOfDay?: string;
    dayOfWeek?: string;
    location?: string;
  }): Promise<string> {
    try {
      const prompt = `
Provide 3 quick, practical travel tips for someone in Cameroon considering:

Weather: ${conditions.weather || "normal conditions"}
Time: ${conditions.timeOfDay || "daytime"}
Day: ${conditions.dayOfWeek || "weekday"}
${conditions.location ? `Location: ${conditions.location}` : ""}

Guidelines:
- Be practical and actionable
- DO NOT mention specific prices
- Focus on safety, efficiency, and comfort
- Keep each tip to one sentence
- Use bullet points

Format as:
• [Tip 1]
• [Tip 2]
• [Tip 3]
      `;

      const result = await this.model.generateContent(prompt);
      const tips = await result.response.text();
      return tips;
    } catch (error) {
      Logger.error("❌ Travel Tips Error:", error);
      return "• Plan your route ahead to avoid delays\n• Keep change ready for transport fares\n• Consider traffic patterns during rush hours";
    }
  }

  /**
   * Helper: Get time of day
   */
  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 6) return "early morning";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    if (hour < 21) return "evening";
    return "night";
  }

  /**
   * Helper: Get day of week
   */
  private getDayOfWeek(): string {
    return new Date().toLocaleDateString("en-US", { weekday: "long" });
  }
}
