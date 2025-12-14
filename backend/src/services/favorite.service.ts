import { prisma } from "../config/database";
import { Events } from "../events";
import { eventBus } from "../events/eventBus";

/**
 * Favorite Routes Service
 */
export class FavoriteService {
  /**
   * Add route to favorites
   */
  async addFavorite(data: {
    userId: string;
    name: string;
    fromAddress: string;
    toAddress: string;
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
    preferredMode?: string;
    notes?: string;
  }) {
    const favorite = await prisma.favoriteRoute.create({
      data: {
        userId: data.userId,
        name: data.name,
        fromAddress: data.fromAddress,
        toAddress: data.toAddress,
        fromLat: data.fromLat,
        fromLng: data.fromLng,
        toLat: data.toLat,
        toLng: data.toLng,
        preferredMode: data.preferredMode,
        notes: data.notes,
      },
    });

    // Emit event
    eventBus.emitEvent(Events.FAVORITE_ADDED, {
      userId: data.userId,
      favoriteId: favorite.id,
      name: data.name,
      timestamp: new Date(),
    });

    return favorite;
  }

  /**
   * Get user's favorite routes
   */
  async getFavorites(userId: string) {
    const favorites = await prisma.favoriteRoute.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      cacheStrategy: { ttl: 60, swr: 30 },
    });

    return favorites;
  }

  /**
   * Get single favorite
   */
  async getFavoriteById(favoriteId: string, userId: string) {
    const favorite = await prisma.favoriteRoute.findFirst({
      where: { id: favoriteId, userId },
    });

    return favorite;
  }

  /**
   * Update favorite
   */
  async updateFavorite(
    favoriteId: string,
    userId: string,
    updates: {
      name?: string;
      preferredMode?: string;
      notes?: string;
    }
  ) {
    const favorite = await prisma.favoriteRoute.updateMany({
      where: { id: favoriteId, userId },
      data: updates,
    });

    if (favorite.count === 0) {
      throw new Error("Favorite not found");
    }

    return { success: true };
  }

  /**
   * Remove from favorites
   */
  async removeFavorite(favoriteId: string, userId: string) {
    const result = await prisma.favoriteRoute.deleteMany({
      where: { id: favoriteId, userId },
    });

    if (result.count === 0) {
      throw new Error("Favorite not found");
    }

    // Emit event
    eventBus.emitEvent(Events.FAVORITE_REMOVED, {
      userId,
      favoriteId,
      timestamp: new Date(),
    });

    return { success: true };
  }

  /**
   * Check if route is favorited
   */
  async isFavorited(
    userId: string,
    fromAddress: string,
    toAddress: string
  ): Promise<boolean> {
    const favorite = await prisma.favoriteRoute.findFirst({
      where: {
        userId,
        fromAddress,
        toAddress,
      },
    });

    return !!favorite;
  }

  /**
   * Toggle favorite (add if not exists, remove if exists)
   */
  async toggleFavorite(data: {
    userId: string;
    name: string;
    fromAddress: string;
    toAddress: string;
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
    preferredMode?: string;
  }) {
    // Check if already favorited
    const existing = await prisma.favoriteRoute.findFirst({
      where: {
        userId: data.userId,
        fromAddress: data.fromAddress,
        toAddress: data.toAddress,
      },
    });

    if (existing) {
      // Remove favorite
      await this.removeFavorite(existing.id, data.userId);
      return { action: "removed", isFavorited: false };
    } else {
      // Add favorite
      await this.addFavorite(data);
      return { action: "added", isFavorited: true };
    }
  }
}

export const favoriteService = new FavoriteService();