import { eventBus } from "../eventBus";
import {
  Events,
  FavoriteAddedPayload,
  FavoriteRemovedPayload,
} from "../eventTypes";
import { prisma } from "../../config/database";
import { sendFavoriteAddedEmail } from "../../config/email";

eventBus.onEvent<FavoriteAddedPayload>(Events.FAVORITE_ADDED, async (data) => {
  try {
    console.log(`⭐ Favorite added: ${data.name}`);

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
    console.log(`📧 Sending favorite confirmation to ${user.email}`);
    
    await sendFavoriteAddedEmail(
      user.email,
      user.name,
      favorite.name,
      favorite.fromAddress,
      favorite.toAddress
    );
  } catch (error) {
    console.error("❌ Error processing FAVORITE_ADDED event:", error);
  }
});

/**
 * Favorite Removed Event Listener
 */
eventBus.onEvent<FavoriteRemovedPayload>(
  Events.FAVORITE_REMOVED,
  async (data) => {
    console.log(`⭐ Favorite removed: ${data.favoriteId}`);
    // Could send "We miss you" email or track analytics
  }
);
console.log("📡 Favorite event listeners registered");
