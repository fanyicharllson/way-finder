import { eventBus } from "../eventBus";
import {
  Events,
  FavoriteAddedPayload,
} from "../eventTypes";
import { prisma } from "../../config/database";
import { sendFavoriteAddedEmail } from "../../services/email.service";
import { Logger } from "../../utils/logger.util";

eventBus.onEvent<FavoriteAddedPayload>(Events.FAVORITE_ADDED, async (data) => {
  try {
    Logger.dev(`⭐ Favorite added: ${data.name}`);

    // Get favorite details
    const favorite = await prisma.favoriteRoute.findUnique({
      where: { id: data.favoriteId },
    });

    if (!favorite) return;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) return;

    // Send email
    Logger.dev(`📧 Sending favorite confirmation to ${user.email}`);
    
    await sendFavoriteAddedEmail(
      user.email,
      user.name,
      favorite.name,
      favorite.fromAddress,
      favorite.toAddress
    );
  } catch (error) {
    Logger.error("❌ Error processing FAVORITE_ADDED event:", error);
  }
});

/**
 * Note: FAVORITE_REMOVED listener removed
 * - Was only logging with no real action
 * - Can be re-enabled when we add:
 *   - Analytics tracking
 *   - "We miss this route" email campaigns
 */

Logger.dev("📡 Favorite event listeners registered (cleaned up)");
