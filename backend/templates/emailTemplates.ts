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
              <p><em>The WayFinder Team(Fanyi Charllson & Lum Nchifor) </em></p>
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

  tripCompleted: (
    name: string,
    origin: string,
    destination: string,
    cost: number,
    mode: string
  ) => ({
    subject: "🎉 Trip Saved - Rate Your Experience!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .trip-summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Trip Saved!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}!</h2>
              <p>Thanks for completing your trip with WayFinder!</p>
              <div class="trip-summary">
                <p><strong>From:</strong> ${origin}</p>
                <p><strong>To:</strong> ${destination}</p>
                <p><strong>Mode:</strong> ${mode}</p>
                <p><strong>Cost:</strong> ${cost} XAF</p>
              </div>
              <p>How was your experience? Rate your trip to help us improve! ⭐⭐⭐⭐⭐</p>
            </div>
            <div class="footer">
              <p>© 2025 WayFinder. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
  favoriteAdded: (
    name: string,
    routeName: string,
    fromAddress: string,
    toAddress: string
  ) => ({
    subject: "⭐ Favorite Route Saved!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .route-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⭐ Favorite Route Saved!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}!</h2>
              <p>You've added a new favorite route:</p>
              <div class="route-card">
                <h3>📍 ${routeName}</h3>
                <p><strong>From:</strong> ${fromAddress}</p>
                <p><strong>To:</strong> ${toAddress}</p>
              </div>
              <p>You can now quickly access this route from your Favorites tab! 🚀</p>
            </div>
            <div class="footer">
              <p>© 2025 WayFinder. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  frequentRoute: (
    name: string,
    fromAddress: string,
    toAddress: string,
    searchCount: number
  ) => ({
    subject: "💡 Save Your Frequent Route!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #ECFDF5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981; }
            .button { display: inline-block; padding: 12px 30px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💡 Tip: Save Your Frequent Route!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}!</h2>
              <p>We noticed you've searched this route <strong>${searchCount} times</strong>:</p>
              <div class="highlight">
                <p><strong>From:</strong> ${fromAddress}</p>
                <p><strong>To:</strong> ${toAddress}</p>
              </div>
              <p>💡 <strong>Pro Tip:</strong> Add this route to your favorites for quick access!</p>
              <p>Save time on future searches by tapping the ⭐ icon next time you search this route.</p>
            </div>
            <div class="footer">
              <p>© 2025 WayFinder. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  milestoneAchievement: (name: string, tripCount: number) => ({
    subject: `🎉 Congratulations! You've completed ${tripCount} trips!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .badge { font-size: 48px; text-align: center; margin: 20px 0; }
            .stats { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f5576c; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Milestone Achievement!</h1>
            </div>
            <div class="content">
              <h2>Amazing Work, ${name}! 🚀</h2>
              
              <div class="badge">✨ ${tripCount} Trips ✨</div>

              <p>You've reached an incredible milestone! You've completed <strong>${tripCount} trips</strong> on WayFinder, and we couldn't be more excited! 🎊</p>

              <div class="stats">
                <h3>Your Journey So Far:</h3>
                <ul>
                  <li>✅ <strong>${tripCount} trips</strong> completed</li>
                  <li>🗺️ You're exploring multiple routes</li>
                  <li>💰 Smart choices for your commute</li>
                  <li>🌟 You're a WayFinder pro!</li>
                </ul>
              </div>

              <p>This achievement shows your dedication to finding the best routes and optimizing your commute. Keep it up!</p>

              <h3>What's Next?</h3>
              <ul>
                <li>🎯 Explore new routes and locations</li>
                <li>📊 Check your travel statistics and savings</li>
                <li>⭐ Manage your favorite routes</li>
                <li>💡 Help friends discover WayFinder</li>
              </ul>

              <p>Thank you for being a dedicated WayFinder user! Your feedback helps us improve every day.</p>
              
              <p><em>Keep exploring! 🧭</em></p>
              <p><em>The WayFinder Team</em></p>
            </div>
            <div class="footer">
              <p>© 2025 WayFinder. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  lowRatingFollowUp: (
    name: string,
    rating: number,
    origin: string,
    destination: string
  ) => ({
    subject: `We're sorry to hear about your recent trip experience 😟`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .trip-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #fa709a; }
            .suggestions { background: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>We Value Your Feedback 💬</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              
              <p>Thank you for rating your recent trip. We're sorry to hear that your experience wasn't as great as we hoped! 😟</p>

              <div class="trip-info">
                <h3>Trip Details:</h3>
                <p><strong>From:</strong> ${origin}</p>
                <p><strong>To:</strong> ${destination}</p>
                <p><strong>Your Rating:</strong> ${rating}/5 ⭐</p>
              </div>

              <p>We take your feedback seriously and want to help you have a better commute experience.</p>

              <div class="suggestions">
                <h3>💡 How we can help:</h3>
                <ul>
                  <li>📝 Tell us what went wrong - reply to this email</li>
                  <li>🔄 Try alternative routes next time for this journey</li>
                  <li>⚙️ Update your preferences to find better options</li>
                  <li>🗺️ Add more favorite locations for variety</li>
                </ul>
              </div>

              <p>Your feedback helps us improve WayFinder for all users. We truly appreciate you taking the time to rate your trip!</p>

              <p>If you have specific suggestions or encountered an issue, please reply to this email. Our team will get back to you within 24 hours.</p>
              
              <p>Happy commuting! 🚀</p>
              <p><em>The WayFinder Team</em></p>
            </div>
            <div class="footer">
              <p>© 2025 WayFinder. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  highRatingCelebration: (name: string, rating: number, transportMode: string) => ({
    subject: `Awesome! Thanks for the 5-star rating! ⭐⭐⭐⭐⭐`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .rating-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; border-top: 4px solid #4facfe; }
            .stars { font-size: 36px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌟 Thank You for the Amazing Rating!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}! 👋</h2>
              
              <p>We absolutely love your feedback! 💙</p>

              <div class="rating-box">
                <p>Your rating for the ${transportMode} route:</p>
                <div class="stars">${Array(rating).fill('⭐').join('')}</div>
                <p><strong>${rating}/5 Stars!</strong></p>
              </div>

              <p>Your positive rating tells us we're doing something right, and it means the world to our team! 🎉</p>

              <h3>What This Helps:</h3>
              <ul>
                <li>✅ Helps other users find great routes</li>
                <li>✅ Shows us which transport modes work best</li>
                <li>✅ Improves our route recommendations</li>
                <li>✅ Motivates our team to keep improving!</li>
              </ul>

              <p><strong>Keep Exploring!</strong> You're discovering some amazing routes. Continue using WayFinder to:</p>
              <ul>
                <li>🗺️ Find new favorite routes</li>
                <li>💰 Track your savings and statistics</li>
                <li>📊 Get personalized recommendations</li>
              </ul>

              <p>Thank you for being an awesome WayFinder user! 🙌</p>
              
              <p><em>Happy commuting! 🚀</em></p>
              <p><em>The WayFinder Team</em></p>
            </div>
            <div class="footer">
              <p>© 2025 WayFinder. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};
