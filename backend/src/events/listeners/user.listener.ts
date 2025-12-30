import { eventBus } from "../eventBus";
import { Events, UserRegisteredPayload } from "../eventTypes";
import { sendWelcomeEmail } from "../../services/email.service";
import { prisma } from "../../config/database";

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
      console.log(`👤 Processing USER_REGISTERED event for: ${data.email}`);

      // 1. Send welcome email to new user
      await sendWelcomeEmail(data.email, data.name);
      console.log(`✅ Welcome email sent to ${data.email}`);

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
        console.log(`✅ User statistics initialized for ${data.userId}`);
      } catch (error) {
        console.warn(
          `⚠️ UserStats table not found. Run 'npx prisma db push' to create it.`
        );
      }

      console.log(`✅ USER_REGISTERED event processed successfully`);
    } catch (error) {
      console.error(`❌ Error processing USER_REGISTERED event:`, error);
    }
  }
);


console.log("✅ User event listeners registered from user.register file");
