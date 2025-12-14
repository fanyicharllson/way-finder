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
              <h1>🚗 Trip Saved!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}!</h2>
              <p>Here's a summary of your saved trip:</p>
              
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
              
              <p><em>The WayFinder Team(Fanyi Charllson & Lum Ndchifor)</em></p>
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
};
