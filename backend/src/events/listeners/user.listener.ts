import { eventBus } from "../eventBus";
import {
  Events,
  UserRegisteredPayload,
  UserLoggedInPayload,
} from "../eventTypes";
import { sendWelcomeEmail } from "../../config/email";
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

      // 1. Send welcome email
      await sendWelcomeEmail(data.email, data.name);

      // 2. Create default preferences if not exists
      const existingPreference = await prisma.userPreference.findUnique({
        where: { userId: data.userId },
      });

      if (!existingPreference) {
        await prisma.userPreference.create({
          data: {
            userId: data.userId,
            maxBudget: 1000,
            preferredModes: ["moto", "bus"],
            avoidanceZones: [],
            priorityType: "balanced",
            isComplete: false,
          },
        });
        console.log(`✅ Default preferences created for user: ${data.userId}`);
      }

      // 3. Log analytics (placeholder - could send to external service)
      console.log(`📊 Analytics: New user registered - ${data.email}`);

      // 4. Future: Could trigger other actions
      // - Send push notification to mobile app
      // - Update user onboarding progress
      // - Trigger welcome SMS
      // - Add to mailing list

      console.log(`✅ USER_REGISTERED event processed successfully`);
    } catch (error) {
      console.error(`❌ Error processing USER_REGISTERED event:`, error);
      // In production, you'd want to:
      // - Send to error tracking service (Sentry)
      // - Retry failed operations
      // - Alert admin if critical
    }
  }
);

/**
 * Handle USER_LOGGED_IN event
 * Actions:
 * 1. Log user activity
 * 2. Update last login timestamp
 * 3. Track login analytics
 */
eventBus.onEvent<UserLoggedInPayload>(Events.USER_LOGGED_IN, async (data) => {
  try {
    console.log(`🔐 Processing USER_LOGGED_IN event for: ${data.email}`);

    // 1. Update last login (you'd add this field to User model)
    // await prisma.user.update({
    //   where: { id: data.userId },
    //   data: { lastLoginAt: data.timestamp },
    // });

    // 2. Track analytics
    console.log(
      `📊 Analytics: User logged in - ${data.email} at ${data.timestamp}`
    );

    // 3. Future: Could send login notification if from new device
    // - Check device fingerprint
    // - Send security alert email

    console.log(`✅ USER_LOGGED_IN event processed successfully`);
  } catch (error) {
    console.error(`❌ Error processing USER_LOGGED_IN event:`, error);
  }
});

console.log("✅ User event listeners registered from user.register file");
