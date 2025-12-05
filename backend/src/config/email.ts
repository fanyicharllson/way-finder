import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

/**
 * Resend Email Service Configuration
 * Resend is a modern email API that's easy to use and reliable
 * Sign up at https://resend.com and get your API key
 */

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
export const emailConfig = {
  from: process.env.EMAIL_FROM || "WayFinder <onboarding@wayfinder.app>",
  replyTo: process.env.EMAIL_REPLY_TO || "support@wayfinder.app",
};

/**
 * Email Templates
 */

export const emailTemplates = {
  welcome: (name: string) => ({
    subject: "Welcome to WayFinder! 🚀",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧭 Welcome to WayFinder!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}! 👋</h2>
              <p>Thank you for joining <strong>WayFinder</strong> - your smart commute companion!</p>
              
              <p>We're excited to help you:</p>
              <ul>
                <li>🗺️ Find the best routes tailored to your preferences</li>
                <li>💰 Save money on daily commutes</li>
                <li>⏱️ Track your travel time and costs</li>
                <li>📊 Get personalized route recommendations</li>
              </ul>

              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Set your preferences (budget, preferred transport modes)</li>
                <li>Add your favorite locations (Home, Work, etc.)</li>
                <li>Start planning your first trip!</li>
              </ol>

              <div style="text-align: center;">
                <a href="#" class="button">Get Started</a>
              </div>

              <p>Need help? Reply to this email and our team will assist you!</p>
              
              <p>Happy commuting! 🚀</p>
              <p><em>The WayFinder Team </em></p>
            </div>
            <div class="footer">
              <p>© 2025 WayFinder. Yaoundé, Cameroon.</p>
              <p>You received this email because you signed up for WayFinder.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  tripSummary: (name: string, tripData: any) => ({
    subject: "Your Trip Summary 📊",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .trip-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 Trip Completed!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}!</h2>
              <p>Here's a summary of your recent trip:</p>
              
              <div class="trip-details">
                <div class="detail-row">
                  <span class="label">From:</span>
                  <span class="value">${tripData.origin}</span>
                </div>
                <div class="detail-row">
                  <span class="label">To:</span>
                  <span class="value">${tripData.destination}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Transport:</span>
                  <span class="value">${tripData.transportMode}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Cost:</span>
                  <span class="value">${tripData.actualCost} XAF</span>
                </div>
                <div class="detail-row">
                  <span class="label">Duration:</span>
                  <span class="value">${tripData.actualTime} minutes</span>
                </div>
                <div class="detail-row">
                  <span class="label">Distance:</span>
                  <span class="value">${tripData.distance} km</span>
                </div>
              </div>

              <p>Keep tracking your trips to get personalized recommendations! 📈</p>
              
              <p><em>The WayFinder Team</em></p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
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
      reply_to: emailConfig.replyTo,
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

export const sendTripSummaryEmail = async (
  email: string,
  name: string,
  tripData: any
): Promise<boolean> => {
  const template = emailTemplates.tripSummary(name, tripData);
  return sendEmail(email, template.subject, template.html);
};
