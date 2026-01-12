import { eventBus } from "../eventBus";
import { Events, UserRegisteredPayload } from "../eventTypes";
import { sendWelcomeEmail } from "../../services/email.service";
import { prisma } from "../../config/database";
import { Logger } from "../../utils/logger.util";

/**
 * User Event Listeners
 *
 * These listeners respond to user-related events and perform side effects
 * without coupling the auth service to email, analytics, etc.
 *
 * BENEFITS:
 * - Loose coupling: Auth service doesn't know about email service
 * - Easy to test: Each listener is independent
 * - Easy to extend: Add new listeners without modifying existing code
 * - Scalable: Can move to Redis Pub/Sub or RabbitMQ later
 */

/**
 * Handle USER_REGISTERED event
 * Actions:
 * 1. Send welcome email
 * 2. Create default preferences
 * 3. Log analytics (future: send to analytics service)
 */
eventBus.onEvent<UserRegisteredPayload>(
  Events.USER_REGISTERED,
  async (data) => {
    try {
      Logger.info(`👤 Processing USER_REGISTERED event for: ${data.email}`);

      // 1. Send welcome email to new user
      await sendWelcomeEmail(data.email, data.name);
      Logger.info(`✅ Welcome email sent to ${data.email}`);

      // 2. Initialize user statistics record (if table exists)
      try {
        await prisma.userStats.upsert({
          where: { userId: data.userId },
          update: {},
          create: {
            userId: data.userId,
            totalTrips: 0,
            totalSpent: 0,
            totalDistance: 0,
            totalTime: 0,
          },
        });
        Logger.info(`✅ User statistics initialized for ${data.userId}`);
      } catch (error) {
        Logger.info(
          `⚠️ UserStats table not found. Run 'npx prisma db push' to create it.`
        );
      }

      Logger.info(`✅ USER_REGISTERED event processed successfully`);
    } catch (error) {
      Logger.error(`❌ Error processing USER_REGISTERED event:`, error);
    }
  }
);


Logger.info("✅ User event listeners registered from user.register file");
