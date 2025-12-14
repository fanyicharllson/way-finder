import { Resend } from "resend";
import dotenv from "dotenv";
import { emailTemplates } from "../../templates/emailTemplates";

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
      console.warn("⚠️ RESEND_API_KEY not set. Email not sent.");
      return false;
    }

    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("❌ Email send error:", error);
      return false;
    }

    console.log("✅ Email sent successfully:", data);
    return true;
  } catch (error) {
    console.error("❌ Email send exception:", error);
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
