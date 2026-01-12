import { prisma } from "../config/database";
import { eventBus } from "../events";
import { Events } from "../events/eventTypes";
import { Logger } from "../utils/logger.util";

/**
 * Search Service
 * Manages recent searches
 */
export class RecentSearchService {
  /**
   * Save a search (or increment count if exists)
   */
  async saveSearch(data: {
    userId: string;
    fromAddress: string;
    toAddress: string;
    fromLat?: number;
    fromLng?: number;
    toLat?: number;
    toLng?: number;
  }) {
    try {
      // Check if this exact search exists
      const existing = await prisma.recentSearch.findUnique({
        where: {
          userId_fromAddress_toAddress: {
            userId: data.userId,
            fromAddress: data.fromAddress,
            toAddress: data.toAddress,
          },
        },
      });

      if (existing) {
        // Update existing search (increment count, update timestamp)
        const updated = await prisma.recentSearch.update({
          where: { id: existing.id },
          data: {
            searchCount: existing.searchCount + 1,
            lastSearched: new Date(),
            // Update coordinates if provided
            fromLat: data.fromLat ?? existing.fromLat,
            fromLng: data.fromLng ?? existing.fromLng,
            toLat: data.toLat ?? existing.toLat,
            toLng: data.toLng ?? existing.toLng,
          },
        });

        return updated;
      }

      // Create new search
      const search = await prisma.recentSearch.create({
        data: {
          userId: data.userId,
          fromAddress: data.fromAddress,
          toAddress: data.toAddress,
          fromLat: data.fromLat,
          fromLng: data.fromLng,
          toLat: data.toLat,
          toLng: data.toLng,
        },
      });

      // Emit event
      eventBus.emitEvent(Events.SEARCH_SAVED, {
        userId: data.userId,
        fromAddress: data.fromAddress,
        toAddress: data.toAddress,
        timestamp: new Date(),
      });

      return search;
    } catch (error) {
      Logger.error("❌ Error saving search:", error);
      throw error;
    }
  }

  /**
   * Get user's recent searches
   */
  async getRecentSearches(userId: string, limit: number = 10) {
    const searches = await prisma.recentSearch.findMany({
      where: { userId },
      orderBy: { lastSearched: "desc" },
      take: limit,
      cacheStrategy: { ttl: 30, swr: 15 },
    });

    return searches;
  }

  /**
   * Get a single recent search
   */
  async getSearchById(searchId: string, userId: string) {
    const search = await prisma.recentSearch.findFirst({
      where: { id: searchId, userId },
    });

    return search;
  }

  /**
   * Clear all recent searches for user
   */
  async clearAllSearches(userId: string) {
    const result = await prisma.recentSearch.deleteMany({
      where: { userId },
    });

    // Emit event
    eventBus.emitEvent(Events.SEARCHES_CLEARED, {
      userId,
      count: result.count,
      timestamp: new Date(),
    });

    return { success: true, deletedCount: result.count };
  }

  /**
   * Delete a specific search
   */
  async deleteSearch(searchId: string, userId: string) {
    const result = await prisma.recentSearch.deleteMany({
      where: { id: searchId, userId },
    });

    if (result.count === 0) {
      throw new Error("Search not found");
    }

    return { success: true };
  }

  /**
   * Get most searched route (for email recommendations)
   */
  async getMostSearchedRoute(userId: string) {
    const searches = await prisma.recentSearch.findMany({
      where: { userId },
      orderBy: { searchCount: "desc" },
      take: 1,
    });

    return searches[0] || null;
  }
}

export const recentSearchService = new RecentSearchService();
