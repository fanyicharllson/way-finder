import { eventBus } from "../eventBus";
import { Events, SearchSavedPayload } from "../eventTypes";
import { prisma } from "../../config/database";
import { sendFrequentRouteEmail } from "../../services/email.service";
import { Logger } from "../../utils/logger.util";

/**
 * Search Saved Event Listener
 * Send email if route is searched frequently (5+ times)
 */
eventBus.onEvent<SearchSavedPayload>(Events.SEARCH_SAVED, async (data) => {
  try {
    Logger.info(`🔍 Search saved: ${data.fromAddress} → ${data.toAddress}`);

    // Get the search to check count
    const search = await prisma.recentSearch.findUnique({
      where: {
        userId_fromAddress_toAddress: {
          userId: data.userId,
          fromAddress: data.fromAddress,
          toAddress: data.toAddress,
        },
      },
    });

    // If searched 5+ times, suggest adding to favorites
    if (search && search.searchCount >= 5) {
      // Check if already favorited
      const isFavorited = await prisma.favoriteRoute.findFirst({
        where: {
          userId: data.userId,
          fromAddress: data.fromAddress,
          toAddress: data.toAddress,
        },
      });

      // Only send email if not already favorited
      if (!isFavorited) {
        const user = await prisma.user.findUnique({
          where: { id: data.userId },
        });

        if (user) {
          Logger.info(`📧 Sending frequent route suggestion to ${user.email}`);
          await sendFrequentRouteEmail(
            user.email,
            user.name,
            data.fromAddress,
            data.toAddress,
            search.searchCount
          );
        }
      }
    }
  } catch (error) {
    Logger.error("❌ Error processing SEARCH_SAVED event:", error);
  }
});
Logger.info("📡 Search event listeners registered");
