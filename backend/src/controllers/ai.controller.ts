import { Request, Response } from "express";
import { AIService } from "../services/ai.service";
import { Logger } from "../utils/logger.util";
// import { eventBus } from '../events/eventBus';

const aiService = AIService.getInstance();

export class AIController {
  /**
   * General AI chat endpoint
   */
  async chat(req: Request, res: Response) {
    try {
      const { message, context } = req.body;
      const userId = req.user?.userId;

      const aiRequest = {
        message,
        context: {
          ...context,
          userId,
        },
      };

      const aiResponse = await aiService.chat(aiRequest);

      return res.status(200).json({
        success: true,
        data: aiResponse,
      });
    } catch (error: any) {
      Logger.error("AI Controller Error:", error);
      return res.status(500).json({
        success: false,
        message: "AI service temporarily unavailable",
        error: error.message,
      });
    }
  }

  /**
   * Smart recommendation endpoint (requires auth)
   */
  // FILE: src/controllers/ai.controller.ts

  async getRecommendation(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { query, message } = req.body; 

      const userQuery = query || message; 

      if (!userQuery?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Query is required",
        });
      }

      const aiResponse = await aiService.getSmartRecommendation(
        userId,
        userQuery
      );

      return res.status(200).json({
        success: true,
        data: aiResponse,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate recommendation",
      });
    }
  }

  /**
   * Get travel tips
   */
  async getTravelTips(req: Request, res: Response) {
    try {
      const { weather, timeOfDay, dayOfWeek } = req.query;

      const tips = await aiService.getTravelTips({
        weather: weather as string,
        timeOfDay: timeOfDay as string,
        dayOfWeek: dayOfWeek as string,
      });

      return res.status(200).json({
        success: true,
        data: { tips },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate tips",
      });
    }
  }
}
