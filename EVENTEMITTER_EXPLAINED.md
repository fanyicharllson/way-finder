# Understanding EventEmitter & Event Flow 🎓

## Table of Contents
1. [What is EventEmitter?](#what-is-eventemitter)
2. [How Node.js EventEmitter Works Internally](#how-nodejs-eventemitter-works)
3. [Complete Event Flow in Your Code](#complete-event-flow)
4. [Step-by-Step Walkthrough](#step-by-step-walkthrough)
5. [Visual Diagrams](#visual-diagrams)

---

## What is EventEmitter?

### Simple Definition
**EventEmitter** is a built-in Node.js class that implements the **Observer Pattern** (also called Pub/Sub pattern). It allows objects to communicate without being tightly coupled.

### From Node.js Core
```javascript
// This is roughly how Node.js EventEmitter works internally:
class EventEmitter {
  constructor() {
    this.listeners = {};  // Dictionary to store all listeners
  }

  on(eventName, callback) {
    // Register a listener
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }

  emit(eventName, data) {
    // Trigger all listeners for this event
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(callback => {
        callback(data);  // Call each listener with the data
      });
    }
  }
}
```

**Key Point**: EventEmitter stores listeners in a dictionary and calls them when an event is emitted.

---

## How Node.js EventEmitter Works Internally

### The Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    EventEmitter Internals                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  INTERNAL DATA STRUCTURE (stored in EventEmitter instance)  │
│  ─────────────────────────────────────────────────────────   │
│                                                              │
│  listeners = {                                              │
│    "user.registered": [                                    │
│      (data) => { sendEmail(data) },    ← user.listener    │
│      (data) => { createPrefs(data) },  ← user.listener    │
│      (data) => { trackAnalytics(data) }← user.listener    │
│    ],                                                       │
│    "preference.updated": [                                │
│      (data) => { invalidateCache(data) },                 │
│      ...                                                   │
│    ],                                                       │
│    ...                                                      │
│  }                                                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Two Key Methods

#### **1. `.on()` or `.onEvent()` - Registration**
```typescript
// In user.listener.ts
eventBus.onEvent<UserRegisteredPayload>(
  Events.USER_REGISTERED,  // ← Event name (key)
  async (data) => {        // ← Callback function (value)
    await sendWelcomeEmail(data.email, data.name);
  }
);
```

**What happens internally:**
```javascript
// Inside EventEmitter
this.listeners["user.registered"] = [
  async (data) => { await sendWelcomeEmail(...) }
];
```

#### **2. `.emit()` or `.emitEvent()` - Triggering**
```typescript
// In auth.service.ts
const eventPayload: UserRegisteredPayload = {
  userId: user.id,
  email: user.email,
  name: user.name,
  timestamp: new Date(),
};

eventBus.emitEvent(Events.USER_REGISTERED, eventPayload);
```

**What happens internally:**
```javascript
// Inside EventEmitter
emit(event, data) {
  const callbacks = this.listeners["user.registered"];
  
  callbacks.forEach(callback => {
    callback(data);  // ← Calls the function with the data
  });
}
```

---

## Complete Event Flow

### The Full Journey of Your Event

```
Step 1: LISTENER REGISTRATION (when app starts)
═════════════════════════════════════════════════

server.ts starts
    ↓
import "./events/listeners/user.listener.ts"
    ↓
user.listener.ts executes
    ↓
eventBus.onEvent<UserRegisteredPayload>(
  Events.USER_REGISTERED,
  async (data) => { ... }
)
    ↓
STORED in EventEmitter.listeners:
listeners["user.registered"] = [
  async (data) => { sendWelcomeEmail(...) },
  async (data) => { createPreferences(...) },
  async (data) => { trackAnalytics(...) }
]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 2: USER REGISTERS (when endpoint is called)
═════════════════════════════════════════════════

Client POST /api/auth/register
    ↓
authController.register()
    ↓
authService.register()
    ↓
Create user in database ✅
    ↓
CREATE EVENT PAYLOAD:
const eventPayload = {
  userId: "uuid-123",
  email: "john@example.com",
  name: "John Doe",
  timestamp: 2025-12-04T10:30:00Z
}
    ↓
eventBus.emitEvent(Events.USER_REGISTERED, eventPayload)
    ↓
INSIDE emitEvent():
  1. Log event: 📡 Event emitted: user.registered { ... }
  2. Call: this.emit(event, data)
       ↓
       EventEmitter.emit("user.registered", eventPayload)
    ↓
INSIDE emit():
  Get all listeners: callbacks = listeners["user.registered"]
  callbacks = [
    async (data) => { sendWelcomeEmail(...) },
    async (data) => { createPreferences(...) },
    async (data) => { trackAnalytics(...) }
  ]
  ↓
  FOR EACH callback in callbacks:
    callback(eventPayload)  ← Passes the data!
  ↓
  ✅ sendWelcomeEmail(eventPayload)
     → sendWelcomeEmail({ userId, email, name, timestamp })
  ✅ createPreferences(eventPayload)
     → createPreferences({ userId, email, name, timestamp })
  ✅ trackAnalytics(eventPayload)
     → trackAnalytics({ userId, email, name, timestamp })
    ↓
RETURN to authService
    ↓
Return { user, token } to client
    ↓
✅ Client gets response immediately (emails, preferences are processing async)
```

---

## Step-by-Step Walkthrough

### Phase 1: Application Startup

**File: `server.ts`**
```typescript
import "./events/listeners/user.listener";      // ← Import user.listener.ts
import "./events/listeners/preference.listener"; // ← Import preference.listener.ts
import "./events/listeners/trip.listener";       // ← Import trip.listener.ts

// When these imports execute, all eventBus.onEvent() calls register listeners
```

### Phase 2: User Listener Registration

**File: `user.listener.ts` (executes on import)**
```typescript
import { eventBus } from "../eventBus";
import { Events } from "../eventTypes";

// This code runs ONCE when the file is imported
eventBus.onEvent<UserRegisteredPayload>(
  Events.USER_REGISTERED,  // = "user.registered"
  async (data) => {
    console.log(`👤 Processing USER_REGISTERED event for: ${data.email}`);
    
    // This function is STORED, not executed yet
    // It waits for an emit() call
    
    await sendWelcomeEmail(data.email, data.name);
    console.log(`✅ Email sent`);
  }
);

// Behind the scenes in EventEmitter:
// listeners["user.registered"] = [
//   async (data) => { ... sendWelcomeEmail ... }
// ]
```

### Phase 3: User Registration (Request comes in)

**File: `auth.controller.ts`**
```typescript
async register(req: Request, res: Response) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
```

### Phase 4: Service Creates User & Emits Event

**File: `auth.service.ts`**
```typescript
async register(data: RegisterDTO): Promise<AuthResponse> {
  // 1. Hash password
  const hashedPassword = await PasswordUtil.hash(data.password);
  
  // 2. Create user in database
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
    },
  });
  
  // 3. Create event payload (prepare the data)
  const eventPayload: UserRegisteredPayload = {
    userId: user.id,           // "123e4567-e89b-12d3-a456-426614174000"
    email: user.email,         // "john@example.com"
    name: user.name,           // "John Doe"
    timestamp: new Date(),     // 2025-12-04T10:30:00.000Z
  };
  
  // 4. EMIT the event
  eventBus.emitEvent(Events.USER_REGISTERED, eventPayload);
  //                                           ↑
  //                                This passes the data!
  
  // 5. Return immediately (listeners run async)
  const token = JWTUtil.generate({
    userId: user.id,
    email: user.email,
  });
  
  return {
    user,
    token,
  };
}
```

### Phase 5: EventBus Calls All Listeners

**File: `eventBus.ts`**
```typescript
emitEvent<T>(event: string, data: T): boolean {
  console.log(`📡 Event emitted: ${event}`, data);
  //                                           ↑
  //                              This logs the data
  
  return this.emit(event, data);
  //                        ↑
  // Calls parent EventEmitter.emit() with data
}
```

**What EventEmitter.emit() does internally:**
```javascript
// Inside Node.js EventEmitter (simplified)
emit(event, data) {
  // Step 1: Get all listeners for this event name
  const listeners = this.listeners["user.registered"];
  
  // Step 2: Call each one with the data
  listeners.forEach(listener => {
    listener(data);  // ← PASS THE DATA HERE!
  });
}
```

### Phase 6: Each Listener Receives the Data

**Listener 1: user.listener.ts**
```typescript
// The listener function receives the data:
async (data) => {
  //      ↑ data = {
  //        userId: "123e4567-...",
  //        email: "john@example.com",
  //        name: "John Doe",
  //        timestamp: 2025-12-04T10:30:00Z
  //      }
  
  // Use it:
  await sendWelcomeEmail(data.email, data.name);
  // Calls: sendWelcomeEmail("john@example.com", "John Doe")
}
```

---

## Visual Diagrams

### Memory Layout When Listener Is Registered

```
┌─────────────────────────────────────────────┐
│         EventBus Instance (Singleton)       │
├─────────────────────────────────────────────┤
│                                             │
│  EventEmitter {                            │
│    listeners: {                            │
│      "user.registered": [                 │
│        Function1 { /* listener code */ } │
│        Function2 { /* listener code */ } │
│        Function3 { /* listener code */ } │
│      ],                                   │
│      "preference.updated": [              │
│        Function4 { /* listener code */ } │
│      ],                                   │
│      ...                                  │
│    }                                      │
│  }                                        │
│                                             │
└─────────────────────────────────────────────┘
```

### Event Emission & Data Flow

```
SERVICE LAYER                EVENTBUS                    LISTENERS
──────────────────────────────────────────────────────────────────

authService.register()
  │
  ├─ Create user
  │
  ├─ Create payload:
  │  {
  │    userId: "123",
  │    email: "john@ex.com",
  │    name: "John Doe",
  │    timestamp: 2025-12-04T10:30:00Z
  │  }
  │
  └─ eventBus.emitEvent(
       "user.registered",
       payload  ←─────────────┐
     )                        │
                              │
                         emitEvent() {
                           console.log(data)
                           return this.emit(
                             event,
                             data  ←─────┐
                           )             │
                         }               │
                                         │
                    EventEmitter.emit(
                      "user.registered",
                      payload  ←──────┐
                    ) {               │
                      const listeners =
                        this.listeners[
                          "user.registered"
                        ];
                      
                      listeners.forEach(
                        listener => {
                          listener(payload) ←─────────────┐
                        }                                 │
                      )                                   │
                    }                                     │
                                                          │
                                    user.listener.ts
                                    async (data) => {
                                      data = {
                                        userId: "123",
                                        email: "john@ex.com",
                                        name: "John Doe",
                                        timestamp: ...
                                      }
                                      
                                      await sendWelcomeEmail(
                                        data.email,
                                        data.name
                                      )
                                    }
```

### Timeline

```
TIME    ACTION                                  DATA FLOW
────────────────────────────────────────────────────────────

T=0     User makes request:
        POST /api/auth/register
        { name, email, password }

T=10ms  authService.register() starts
        
T=20ms  User created in database
        Returns: { id, name, email, ... }

T=30ms  ✅ CREATE PAYLOAD
        eventPayload = {
          userId: "...",
          email: "...",
          name: "...",
          timestamp: ...
        }

T=31ms  ✅ EMIT EVENT
        eventBus.emitEvent(
          "user.registered",
          eventPayload  ← DATA PASSES HERE
        )

T=32ms  ✅ PASS TO LISTENERS
        listeners["user.registered"].forEach(
          listener => listener(eventPayload)
        )

T=33ms  ✅ RETURN TO CLIENT
        Response sent: { user, token }
        (Client doesn't wait for listeners)

T=34ms  ⏳ Listener 1 starts async:
           sendWelcomeEmail(data.email, data.name)
           (PARALLEL, doesn't block response)

T=35ms  ⏳ Listener 2 starts async:
           createDefaultPreferences(data.userId)

T=50ms  ✅ Email sent (async completed)
T=60ms  ✅ Preferences created (async completed)
```

---

## Why This Design?

### Without Events (❌ Bad)
```typescript
async register(data) {
  const user = await createUser(data);
  
  // Directly call other services
  await emailService.send(user.email);  // Wait for email
  await prefService.create(user.id);    // Wait for prefs
  await analyticsService.track(user);   // Wait for analytics
  
  return user;
  // Total time: 1s (email) + 0.5s (prefs) + 0.2s (analytics) = 1.7s
  // If email fails, registration fails!
}
```

### With Events (✅ Good)
```typescript
async register(data) {
  const user = await createUser(data);
  
  // Emit event (instant, no waiting)
  eventBus.emit("user.registered", { userId, email, name });
  
  return user;
  // Total time: ~10ms (just emit)
  // If email fails, registration still succeeds!
  // Email sends in background: async
}
```

---

## Key Takeaways 🎯

1. **EventEmitter stores listeners** - In an internal dictionary by event name
2. **`on()` registers** - Stores a callback function
3. **`emit()` triggers** - Calls all stored callbacks with the data
4. **Data is passed as argument** - `listener(data)` function call
5. **Async by default** - Listeners run in background, don't block response
6. **Decoupled** - Service doesn't know about listeners, listeners don't know about each other

---

## Real-World Analogy 🎭

**Think of it like a restaurant:**

1. **EventEmitter** = Restaurant notification system
2. **`.on()`** = Chef registers for "order-ready" notifications
3. **`.emit()`** = Kitchen buzzer goes off with order data
4. **Callback** = Chef's action when he hears the buzzer
5. **Data** = The actual order details (what to cook)

```
Customer places order
      ↓
Kitchen creates: {
  order_id: 123,
  items: ["pizza", "pasta"],
  table: 5
}
      ↓
BUZZER RINGS (emit event)
      ↓
Chef1 gets notification: "Order 123 ready - items: [pizza, pasta] - table 5"
Chef2 gets notification: "Order 123 ready - items: [pizza, pasta] - table 5"
Waiter gets notification: "Order 123 ready - items: [pizza, pasta] - table 5"
      ↓
ALL act on the same data simultaneously!
```

---

**Now you understand the internals!** 🚀

The `import { EventEmitter }` is the magic that handles the internal registration and triggering of listeners. Your code just uses the `.on()` and `.emit()` methods that EventEmitter provides!
