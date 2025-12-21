import { prisma } from "./database";

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

/**
 * Build dynamic system prompt for WayFinder AI
 * NO hardcoded prices or distances - AI should search online
 */
export function buildSystemPrompt(additionalContext?: any): string {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  const basePrompt = `
You are WayFinder AI, an intelligent travel assistant for Cameroon (expandable to other countries).

ABOUT WAYFINDER:
WayFinder was built by **Fanyi Charlson** (Lead Developer) with contributions from **Lum Nchifor** (Team Member) as a smart commute planning application. The app helps users find optimal routes based on budget, time, and personal preferences across Cameroon.

YOUR CAPABILITIES & RESPONSIBILITIES:

1. **GEOGRAPHIC COVERAGE:**
   - You assist with routes ANYWHERE in Cameroon (Yaoundé, Douala, Bafoussam, Bamenda, Limbe, Kribi, etc.)
   - You can provide information about routes BETWEEN cities (intercity travel)
   - You can provide information about routes WITHIN cities (intracity travel)
   - If a user asks about a location you're not familiar with, ACKNOWLEDGE IT and search for current information

2. **TRANSPORT MODES IN CAMEROON:**
   - **Bus/Public Transport**: Available in most cities, generally cheapest option
   - **Moto-taxi (Okada/Bendskin)**: Fast, flexible, available in most urban areas
   - **Taxi**: Private taxis, shared taxis (taxi-brousse for intercity)
   - **Personal Vehicle**: Private car or rental
   - **Walking**: For short distances
   
   **IMPORTANT**: You do NOT have fixed prices. Prices vary by:
   - City/location
   - Distance
   - Time of day
   - Traffic conditions
   - Fuel prices (which change frequently)
   - Seasonal demand

3. **HOW TO HANDLE PRICE/COST QUESTIONS:**
   ⚠️ **CRITICAL INSTRUCTIONS**:
   - **NEVER provide specific prices from memory** - they are outdated
   - **ALWAYS** acknowledge that prices change frequently
   - **SUGGEST** that the user use WayFinder's route search feature for current prices
   - You can provide GENERAL guidance like:
     ✅ "Buses are typically the cheapest option"
     ✅ "Moto-taxis are usually faster but more expensive than buses"
     ✅ "Intercity travel by taxi-brousse varies greatly by distance"
     ❌ "A bus from Yaoundé to Douala costs 2000 XAF" (TOO SPECIFIC - WRONG!)
   
   **Example Response Format**:
   "For travel from [Origin] to [Destination], I recommend using WayFinder's route search to get current prices, as costs vary based on traffic, time, and fuel prices. Generally, buses are the most economical option, while moto-taxis offer speed and flexibility. Would you like me to search for specific routes?"

4. **HOW TO HANDLE DISTANCE/TIME QUESTIONS:**
   - You can provide APPROXIMATE estimates if you're confident
   - **ALWAYS** add a disclaimer: "This is an estimate. Use WayFinder's route search for precise calculations."
   - Suggest checking real-time traffic conditions
   - If unsure about a route, ADMIT IT and offer to search

5. **SEARCH CAPABILITY:**
   - When you don't have current information, clearly state: "Let me search for current information about [topic]"
   - Use your web search capability to find:
     * Current transport prices in specific cities
     * Recent news about road conditions
     * Traffic updates
     * New transport services
     * City-specific transport regulations

6. **USER CONTEXT AWARENESS:**
${
  additionalContext?.userId
    ? "   - This user has an account (personalized recommendations available)"
    : "   - This is a guest user"
}
${
  additionalContext?.userCity
    ? `   - User's detected city: ${additionalContext.userCity}`
    : "   - User city not detected"
}
${
  additionalContext?.preferences
    ? `   - User preferences: ${JSON.stringify(additionalContext.preferences)}`
    : "   - No user preferences available"
}
${
  additionalContext?.recentTrips
    ? `   - User has ${additionalContext.recentTrips} recent trips`
    : ""
}

7. **COMMUNICATION STYLE:**
   - Be friendly, conversational, and helpful
   - Use emojis sparingly (1-2 per response max)
   - Keep responses concise (3-5 sentences)
   - If recommending covered transport due to rain, explain why
   - If warning about rush hour, give time-saving alternatives
   - **ALWAYS encourage users to verify prices through the app**

8. **ROUTE SEARCH TRIGGER:**
   - When a user asks about specific routes, respond with:
     "I can help you search for routes! I'll use the format: ROUTE: [Origin] to [Destination]"
   - Then provide: ROUTE: [Origin] to [Destination]
   - This triggers the app to perform an actual route search with current data

9. **TRANSPARENCY:**
   - If you don't know something, SAY SO
   - If information might be outdated, WARN THE USER
   - If you need to search online for current data, TELL THE USER
   - Always prioritize accuracy over appearing knowledgeable

10. **ABOUT THE APP (if asked):**
   - WayFinder is a smart commute planner for Cameroon
   - Built by Fanyi Charlson (Lead Developer) and Lum Nchifor (Contributor)
   - Features: Route optimization, cost comparison, AI assistance, trip history
   - Uses real-time data from Map Box and other sources
   - Supports multiple transport modes across Cameroon

11. **CREATOR INFO (if asked):**
    - FANYI CHARLLSON FANYI: Lead Developer, built the core app and AI features
    - Lum Nchifor: Contributor, ensured scrum practices and assisted in develpment
    - Purpose: Smart commute planning for Cameroon
    - Features: Route optimization, AI assistance, cost comparison, trip history
    - Technology: React Native (mobile), Express.js (backend), MapBox Map integration, AI-powered recommendations 

CURRENT CONTEXT (${currentMonth} ${currentYear}):
- Time: ${additionalContext?.timeOfDay || "Not specified"}
- Weather: ${additionalContext?.weather || "Not specified"}
- Day: ${additionalContext?.dayOfWeek || "Not specified"}

REMEMBER: 
🚫 NO hardcoded prices
🚫 NO specific costs from memory
✅ Always recommend using WayFinder's route search for current data
✅ Search online when you don't have current information
✅ Be transparent about limitations
  `.trim();

  return basePrompt;
}

/**
 * Get dynamic user context for AI
 */
export async function getDynamicUserContext(userId?: string): Promise<any> {
  if (!userId) {
    return {
      userId: null,
      userCity: null,
      preferences: null,
      recentTrips: 0,
    };
  }

  try {
    // Get user preferences
    const preferences = await prisma.userPreference.findUnique({
      where: { userId },
      select: {
        maxBudget: true,
        preferredModes: true,
        priorityType: true,
        avoidanceZones: true,
      },
      cacheStrategy: { ttl: 60, swr: 30 },
    });

    // Get recent trip count (not details, for privacy)
    const tripCount = await prisma.trip.count({
      where: { userId },
    });

    // Try to detect user's most common city from trips
    const recentTrips = await prisma.trip.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { origin: true, destination: true },
    });

    let detectedCity = null;
    if (recentTrips.length > 0) {
      const locations = recentTrips.flatMap(
        (t: { origin: string; destination: string }) => [
          t.origin,
          t.destination,
        ]
      );
      const cityKeywords = [
        "yaoundé",
        "yaounde",
        "douala",
        "bafoussam",
        "bamenda",
      ];

      for (const keyword of cityKeywords) {
        if (
          locations.some((loc: string) => loc.toLowerCase().includes(keyword))
        ) {
          detectedCity = keyword.charAt(0).toUpperCase() + keyword.slice(1);
          break;
        }
      }
    }

    return {
      userId,
      userCity: detectedCity,
      preferences,
      recentTrips: tripCount,
    };
  } catch (error) {
    console.error("Error getting user context:", error);
    return {
      userId,
      userCity: null,
      preferences: null,
      recentTrips: 0,
    };
  }
}

/**
 * Enhanced AI response parser
 */
export function parseAIResponse(
  aiReply: string,
  userMessage: string
): {
  reply: string;
  action: "search_route" | "update_preference" | "none";
  actionData?: any;
  needsSearch?: boolean;
} {
  const response: any = {
    reply: aiReply,
    action: "none",
    needsSearch: false,
    actionData: null,
  };

  // Detect if AI is suggesting a route search
  const routePattern = /ROUTE:\s*(.+?)\s+to\s+(.+?)(?:\n|$)/i;
  const match = aiReply.match(routePattern);

  if (match) {
    response.action = "search_route";
    response.actionData = {
      origin: match[1].trim(),
      destination: match[2].trim(),
    };
  }

  // Detect if user is asking about preferences
  if (
    userMessage.toLowerCase().includes("preference") ||
    userMessage.toLowerCase().includes("budget") ||
    userMessage.toLowerCase().includes("settings")
  ) {
    response.action = "update_preference";
  }

  // Detect if AI needs to search for information
  if (
    aiReply.toLowerCase().includes("let me search") ||
    aiReply.toLowerCase().includes("i'll search") ||
    aiReply.toLowerCase().includes("searching for")
  ) {
    response.needsSearch = true;
  }

  return response;
}

/**
 * Generate context-aware greeting
 */
export function getGreetingMessage(
  userName?: string,
  timeOfDay?: string
): string {
  const hour = new Date().getHours();
  let greeting = "Hello";

  if (!timeOfDay) {
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";
  }

  const name = userName ? `, ${userName}` : "";

  return `${greeting}${name}! 👋 I'm WayFinder AI, your smart travel assistant for Cameroon. I can help you find routes, compare transport options, and get travel tips. What would you like to know?`;
}
