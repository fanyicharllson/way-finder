import { Resend } from "resend";
import dotenv from "dotenv";
import { emailTemplates } from "../templates/emailTemplates";
import { Logger } from "../utils/logger.util";

dotenv.config();

/**
 * Resend Email Service Configuration
 * Resend is a modern email API that's easy to use and reliable
 */

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
export const emailConfig = {
  from: process.env.EMAIL_FROM || "WayFinder <onboarding@teamnest.me>",
  replyTo: process.env.EMAIL_REPLY_TO || "support@teamnest.me",
};

/**
 * Email Service Functions
 */

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<boolean> => {
  try {
    if (!process.env.RESEND_API_KEY) {
      Logger.warn("⚠️ RESEND_API_KEY not set. Email not sent.");
      return false;
    }

    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: [to],
      subject,
      html,
    });

    if (error) {
      Logger.error("❌ Email send error:", error);
      return false;
    }

    Logger.dev("✅ Email sent successfully:", data);
    return true;
  } catch (error) {
    Logger.error("❌ Email send exception:", error);
    return false;
  }
};

export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<boolean> => {
  const template = emailTemplates.welcome(name);
  return sendEmail(email, template.subject, template.html);
};

export const sendFavoriteAddedEmail = async (
  email: string,
  name: string,
  routeName: string,
  fromAddress: string,
  toAddress: string
): Promise<boolean> => {
  const template = emailTemplates.favoriteAdded(
    name,
    routeName,
    fromAddress,
    toAddress
  );
  return sendEmail(email, template.subject, template.html);
};

export const sendFrequentRouteEmail = async (
  email: string,
  name: string,
  fromAddress: string,
  toAddress: string,
  searchCount: number
): Promise<boolean> => {
  const template = emailTemplates.frequentRoute(
    name,
    fromAddress,
    toAddress,
    searchCount
  );
  return sendEmail(email, template.subject, template.html);
};

export const sendTripSummaryEmail = async (
  email: string,
  name: string,
  tripData: {
    origin: string;
    destination: string;
    transportMode: string;
    actualCost: number;
    actualTime?: number;
    distance?: number;
  }
): Promise<boolean> => {
  const template = emailTemplates.tripCompleted(
    name,
    tripData.origin,
    tripData.destination,
    tripData.actualCost,
    tripData.transportMode
  );
  return sendEmail(email, template.subject, template.html);
};

export const sendMilestoneAchievementEmail = async (
  email: string,
  name: string,
  tripCount: number
): Promise<boolean> => {
  const template = emailTemplates.milestoneAchievement(name, tripCount);
  return sendEmail(email, template.subject, template.html);
};

export const sendLowRatingFollowUpEmail = async (
  email: string,
  name: string,
  rating: number,
  origin: string,
  destination: string
): Promise<boolean> => {
  const template = emailTemplates.lowRatingFollowUp(
    name,
    rating,
    origin,
    destination
  );
  return sendEmail(email, template.subject, template.html);
};

export const sendHighRatingCelebrationEmail = async (
  email: string,
  name: string,
  rating: number,
  transportMode: string
): Promise<boolean> => {
  const template = emailTemplates.highRatingCelebration(
    name,
    rating,
    transportMode
  );
  return sendEmail(email, template.subject, template.html);
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  code: string
): Promise<boolean> => {
  const template = emailTemplates.passwordReset(name, code);
  return sendEmail(email, template.subject, template.html);
};

export const sendPasswordResetConfirmationEmail = async (
  email: string,
  name: string
): Promise<boolean> => {
  const template = emailTemplates.passwordResetConfirmation(name);
  return sendEmail(email, template.subject, template.html);
};

// Export as a class for consistency with other services
export class EmailService {
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    return sendWelcomeEmail(email, name);
  }

  async sendPasswordResetEmail(email: string, name: string, code: string): Promise<boolean> {
    return sendPasswordResetEmail(email, name, code);
  }

  async sendPasswordResetConfirmationEmail(email: string, name: string): Promise<boolean> {
    return sendPasswordResetConfirmationEmail(email, name);
  }

  async sendFavoriteAddedEmail(
    email: string,
    name: string,
    routeName: string,
    fromAddress: string,
    toAddress: string
  ): Promise<boolean> {
    return sendFavoriteAddedEmail(email, name, routeName, fromAddress, toAddress);
  }

  async sendTripCompletedEmail(
    email: string,
    name: string,
    origin: string,
    destination: string,
    cost: number,
    mode: string
  ): Promise<boolean> {
    return sendTripSummaryEmail(email, name, {
      origin,
      destination,
      transportMode: mode,
      actualCost: cost,
    });
  }
}
