/**
 * PRACTICAL CODE WALKTHROUGH: How EventEmitter Works
 * 
 * This file shows the EXACT flow of data through your event system
 * with real code examples
 */

// ═══════════════════════════════════════════════════════════════
// STEP 1: SERVER STARTS (server.ts)
// ═══════════════════════════════════════════════════════════════

// server.ts (simplified)
import express from "express";
import "./events/listeners/user.listener";  // ← Registers listeners!
import "./events/listeners/preference.listener";
import "./events/listeners/trip.listener";

// When these imports run, the eventBus.onEvent() calls execute
// → Listeners are now stored in EventEmitter.listeners dictionary

const app = express();
app.listen(3000, () => {
  console.log("🚀 Server started");
  // At this point, all listeners are registered and waiting
});

// ═══════════════════════════════════════════════════════════════
// STEP 2: LISTENER REGISTRATION (user.listener.ts)
// ═══════════════════════════════════════════════════════════════

// user.listener.ts (simplified - shows what happens)
import { eventBus } from "../eventBus";
import { Events, UserRegisteredPayload } from "../eventTypes";

// This code executes when the file is imported (on server startup)
console.log("📝 Registering USER_REGISTERED listener...");

eventBus.onEvent<UserRegisteredPayload>(
  Events.USER_REGISTERED,  // = "user.registered" (string)
  async (data) => {
    // This function is STORED, not executed immediately
    // It waits for emit() to call it
    
    console.log(`👤 User registered listener triggered!`);
    console.log(`   Received data:`, data);
    console.log(`   data.email = ${data.email}`);
    console.log(`   data.name = ${data.name}`);
    console.log(`   data.userId = ${data.userId}`);
    
    // Send welcome email
    await sendWelcomeEmail(data.email, data.name);
    console.log(`✅ Welcome email sent to ${data.email}`);
  }
);

console.log("✅ Listener registered successfully");

// ┌─────────────────────────────────────────────────────────────┐
// │ What's stored in EventEmitter.listeners at this point:      │
// │                                                             │
// │ listeners = {                                              │
// │   "user.registered": [                                    │
// │     async (data) => {                                     │
// │       console.log(`👤 User registered...`)                │
// │       await sendWelcomeEmail(data.email, data.name)      │
// │       console.log(`✅ Email sent...`)                      │
// │     }                                                      │
// │   ]                                                        │
// │ }                                                          │
// │                                                             │
// └─────────────────────────────────────────────────────────────┘

// ═══════════════════════════════════════════════════════════════
// STEP 3: USER REGISTERS (authController.ts)
// ═══════════════════════════════════════════════════════════════

// authController.ts
async register(req: Request, res: Response) {
  console.log("📥 POST /api/auth/register received");
  console.log("   Body:", req.body);
  // Body: { name: "John Doe", email: "john@example.com", password: "abc123" }
  
  try {
    const result = await authService.register(req.body);
    console.log("✅ Registration successful, sending response");
    res.status(201).json(result);
    // Response sent immediately (listeners run async!)
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// ═══════════════════════════════════════════════════════════════
// STEP 4: SERVICE CREATES USER & EMITS EVENT (auth.service.ts)
// ═══════════════════════════════════════════════════════════════

// auth.service.ts
import { eventBus, Events, UserRegisteredPayload } from "../events";

async register(data: RegisterDTO): Promise<AuthResponse> {
  console.log("🔧 AuthService.register() called");
  console.log("   Input:", data);
  
  // 1. Validate password
  console.log("🔐 Validating password...");
  const passwordValidation = PasswordUtil.validate(data.password);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.message);
  }
  console.log("✅ Password valid");
  
  // 2. Hash password
  console.log("🔐 Hashing password...");
  const hashedPassword = await PasswordUtil.hash(data.password);
  console.log("✅ Password hashed");
  
  // 3. Create user in database
  console.log("💾 Creating user in database...");
  const user = await prisma.user.create({
    data: {
      name: data.name,           // "John Doe"
      email: data.email,         // "john@example.com"
      phone: data.phone,         // "237690123456"
      password: hashedPassword,  // "$2b$10$xyz..."
    },
  });
  console.log("✅ User created:", {
    id: user.id,                 // "123e4567-e89b-12d3-a456-426614174000"
    name: user.name,             // "John Doe"
    email: user.email,           // "john@example.com"
  });
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IMPORTANT: Now we create an EVENT PAYLOAD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  console.log("📋 Creating event payload...");
  const eventPayload: UserRegisteredPayload = {
    userId: user.id,           // "123e4567-e89b-12d3-a456-426614174000"
    email: user.email,         // "john@example.com"
    name: user.name,           // "John Doe"
    timestamp: new Date(),     // 2025-12-04T10:30:00.000Z
  };
  console.log("✅ Event payload created:", eventPayload);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CRITICAL MOMENT: EMIT THE EVENT
  // This is where the data gets passed to listeners!
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  console.log("📡 Emitting USER_REGISTERED event with payload...");
  eventBus.emitEvent(Events.USER_REGISTERED, eventPayload);
  //                                          ↑
  //                                  THIS PASSES THE DATA!
  
  // ═════════════════════════════════════════════════════════════
  // What happens inside emitEvent():
  // ═════════════════════════════════════════════════════════════
  
  /*
    eventBus.emitEvent(event, data) {
      console.log(`📡 Event emitted: ${event}`, data);
      //                                          ↑
      //                      Logs the data we're passing
      
      return this.emit(event, data);
      //                       ↑
      //           Passes data to parent EventEmitter
    }
    
    // Inside Node.js EventEmitter.emit():
    emit(event, data) {
      // Step 1: Find all listeners for this event name
      const callbacks = this.listeners["user.registered"];
      
      // callbacks = [
      //   async (data) => {
      //     console.log(`👤 User registered listener triggered!`)
      //     console.log(`   Received data:`, data)
      //     await sendWelcomeEmail(data.email, data.name)
      //   }
      // ]
      
      // Step 2: Call EACH callback with the data
      callbacks.forEach(callback => {
        callback(data);  // ← DATA PASSED HERE AS PARAMETER!
      });
      
      // What actually happens:
      // async (data) => {
      //   console.log(`👤 User registered listener triggered!`)
      //   console.log(`   Received data:`, {
      //     userId: "123e4567-e89b-12d3-a456-426614174000",
      //     email: "john@example.com",
      //     name: "John Doe",
      //     timestamp: 2025-12-04T10:30:00.000Z
      //   })
      //   await sendWelcomeEmail("john@example.com", "John Doe")
      // }(eventPayload)
    }
  */
  
  // 4. Generate JWT token
  console.log("🔑 Generating JWT token...");
  const token = JWTUtil.generate({
    userId: user.id,
    email: user.email,
  });
  console.log("✅ Token generated");
  
  // 5. Return response (listeners are running async in background!)
  console.log("📤 Returning response to client");
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
    token,
  };
}

// ═══════════════════════════════════════════════════════════════
// STEP 5: LISTENER EXECUTES (back in user.listener.ts)
// ═══════════════════════════════════════════════════════════════

// This code executes AFTER emitEvent() is called
// The data parameter contains exactly what we passed to emit()

eventBus.onEvent<UserRegisteredPayload>(
  Events.USER_REGISTERED,
  async (data) => {
    // ┌─────────────────────────────────────────────────────────┐
    // │ data parameter contains:                                │
    // │                                                         │
    // │ {                                                       │
    // │   userId: "123e4567-e89b-12d3-a456-426614174000",      │
    // │   email: "john@example.com",                           │
    // │   name: "John Doe",                                    │
    // │   timestamp: 2025-12-04T10:30:00.000Z                  │
    // │ }                                                       │
    // │                                                         │
    // │ This is the EXACT payload we created and passed!       │
    // └─────────────────────────────────────────────────────────┘
    
    console.log(`👤 Processing USER_REGISTERED event for: ${data.email}`);
    
    // Use the data:
    const userId = data.userId;                    // Extract userId
    const email = data.email;                      // Extract email
    const name = data.name;                        // Extract name
    const timestamp = data.timestamp;              // Extract timestamp
    
    // 1. Send welcome email (using the data)
    console.log(`📧 Sending welcome email to ${email}...`);
    await sendWelcomeEmail(email, name);
    console.log(`✅ Email sent to ${email}`);
    
    // 2. Create default preferences (using the data)
    console.log(`⚙️ Creating default preferences for user ${userId}...`);
    const existingPreference = await prisma.userPreference.findUnique({
      where: { userId: userId },
    });
    
    if (!existingPreference) {
      await prisma.userPreference.create({
        data: {
          userId: userId,  // ← Used data.userId here
          maxBudget: 1000,
          preferredModes: ["moto", "bus"],
          avoidanceZones: [],
          priorityType: "balanced",
          isComplete: false,
        },
      });
      console.log(`✅ Default preferences created for user: ${userId}`);
    }
    
    // 3. Track analytics (using the data)
    console.log(`📊 Analytics: New user registered - ${email}`);
    // Could send to analytics service here
    
    console.log(`✅ USER_REGISTERED event processed successfully`);
  }
);

// ═══════════════════════════════════════════════════════════════
// STEP 6: RESPONSE SENT TO CLIENT
// ═══════════════════════════════════════════════════════════════

// Back in authController.ts
// res.status(201).json(result);

// Client receives:
// {
//   "user": {
//     "id": "123e4567-e89b-12d3-a456-426614174000",
//     "name": "John Doe",
//     "email": "john@example.com",
//     "phone": "237690123456"
//   },
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
// }

// Meanwhile, the listener is still running async in the background!
// - Email is being sent
// - Preferences are being created
// - Analytics are being tracked

// This happens WITHOUT SLOWING DOWN THE RESPONSE!

// ═══════════════════════════════════════════════════════════════
// CONSOLE OUTPUT ORDER
// ═══════════════════════════════════════════════════════════════

// TIMELINE:
// T=0ms:   📥 POST /api/auth/register received
// T=1ms:   📋 Creating event payload...
// T=2ms:   ✅ Event payload created: { userId, email, name, timestamp }
// T=3ms:   📡 Emitting USER_REGISTERED event with payload...
// T=4ms:   📡 Event emitted: user.registered { userId, email, name, timestamp }
// T=5ms:   🔑 Generating JWT token...
// T=6ms:   ✅ Token generated
// T=7ms:   📤 Returning response to client
// T=8ms:   ✅ Registration successful, sending response
// T=9ms:   👤 Processing USER_REGISTERED event for: john@example.com
// T=10ms:  📧 Sending welcome email to john@example.com...
// T=50ms:  ✅ Email sent to john@example.com
// T=51ms:  ⚙️ Creating default preferences for user 123e4567-e89b-12d3...
// T=52ms:  ✅ Default preferences created for user: 123e4567-e89b-12d3...
// T=53ms:  📊 Analytics: New user registered - john@example.com
// T=54ms:  ✅ USER_REGISTERED event processed successfully

// ═══════════════════════════════════════════════════════════════
// KEY INSIGHTS
// ═══════════════════════════════════════════════════════════════

/*
1. LISTENER REGISTRATION HAPPENS ON STARTUP
   - eventBus.onEvent() stores the callback function
   - The callback is NOT executed, just stored
   - Stored in EventEmitter.listeners["event-name"] = [callbacks...]

2. EMIT PASSES DATA TO THE STORED CALLBACK
   - eventBus.emitEvent(name, data) is called
   - emitEvent passes data to EventEmitter.emit()
   - emit() finds all callbacks for that event name
   - emit() calls: callback(data) with the data as parameter

3. LISTENER RECEIVES DATA AS FUNCTION PARAMETER
   - The callback function: async (data) => { ... }
   - data parameter = exactly what was passed to emit()
   - Listener can use: data.userId, data.email, etc.

4. EVERYTHING IS ASYNC BY DEFAULT
   - emit() doesn't wait for callbacks to finish
   - Client gets response immediately
   - Callbacks run in background without blocking

5. THE MAGIC: Node.js EventEmitter
   - import { EventEmitter } from "events"
   - Provides .on() method to register callbacks
   - Provides .emit() method to trigger callbacks
   - Handles all the internal data passing!
*/

export {};
