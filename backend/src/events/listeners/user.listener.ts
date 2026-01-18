import { eventBus } from "../eventBus";
import { 
  Events, 
  UserRegisteredPayload, 
  PasswordResetRequestedPayload,
  PasswordResetCompletedPayload 
} from "../eventTypes";
import { 
  sendWelcomeEmail, 
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail
} from "../../services/email.service";
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

/**
 * Handle PASSWORD_RESET_REQUESTED event
 * Actions:
 * 1. Send password reset email with verification code
 * 2. Log security event
 */
eventBus.onEvent<PasswordResetRequestedPayload>(
  Events.PASSWORD_RESET_REQUESTED,
  async (data) => {
    try {
      Logger.dev(`🔐 Processing PASSWORD_RESET_REQUESTED event for: ${data.email}`);

      // Send password reset email with code
      await sendPasswordResetEmail(data.email, data.name, data.code);
      Logger.dev(`✅ Password reset email sent to ${data.email}`);

      // Log security event (could be sent to security monitoring service)
      Logger.dev(`🔒 Password reset code generated for user ${data.userId}, expires at ${data.expiresAt}`);

      Logger.info(`✅ PASSWORD_RESET_REQUESTED event processed successfully`);
    } catch (error) {
      Logger.error(`❌ Error processing PASSWORD_RESET_REQUESTED event:`, error);
    }
  }
);

/**
 * Handle PASSWORD_RESET_COMPLETED event
 * Actions:
 * 1. Log security event
 * 2. Could send notification email (optional)
 * 3. Could invalidate other sessions (future feature)
 */
eventBus.onEvent<PasswordResetCompletedPayload>(
  Events.PASSWORD_RESET_COMPLETED,
  async (data) => {
    try {
      Logger.dev(`🔐 Processing PASSWORD_RESET_COMPLETED event for: ${data.email}`);

      // Log security event
      Logger.dev(`✅ Password successfully reset for user ${data.userId}`);

      // Get user details for confirmation email
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { name: true },
      });

      if (user) {
        // Send confirmation email
        await sendPasswordResetConfirmationEmail(data.email, user.name);
        Logger.dev(`✅ Password reset confirmation email sent to ${data.email}`);
      }

      // Future: Invalidate all existing sessions
      // await invalidateUserSessions(data.userId);

      Logger.info(`✅ PASSWORD_RESET_COMPLETED event processed successfully`);
    } catch (error) {
      Logger.error(`❌ Error processing PASSWORD_RESET_COMPLETED event:`, error);
    }
  }
);

Logger.info("✅ Password reset event listeners registered");
