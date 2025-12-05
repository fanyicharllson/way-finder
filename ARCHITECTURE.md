# Event-Driven Architecture Documentation 🎯

## Overview

WayFinder implements an **Event-Driven Architecture** using the Observer/Pub-Sub pattern. This design decouples services and enables asynchronous processing of side effects.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    WayFinder Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐        ┌──────────────┐                 │
│  │   Frontend   │◄──────►│     API      │                 │
│  │ Mobile + Web │  HTTP  │   Gateway    │                 │
│  └──────────────┘        └──────┬───────┘                 │
│                                  │                          │
│  ┌──────────────────────────────▼───────────────────────┐ │
│  │            Service Layer (Business Logic)            │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │ │
│  │  │   Auth   │  │ Location │  │Preference│           │ │
│  │  │ Service  │  │ Service  │  │ Service  │           │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘           │ │
│  │       │             │             │                   │ │
│  │       └─────────────┼─────────────┘                   │ │
│  │                     │ emit events                     │ │
│  └─────────────────────┼─────────────────────────────────┘ │
│                        │                                   │
│  ┌─────────────────────▼─────────────────────────────────┐ │
│  │               Event Bus (Observer)                    │ │
│  │             (Node.js EventEmitter)                    │ │
│  └─────────────────────┬─────────────────────────────────┘ │
│                        │                                   │
│                        │ distribute to listeners           │
│         ┌──────────────┼──────────────┐                   │
│         │              │              │                   │
│  ┌──────▼──────┐ ┌────▼──────┐ ┌────▼──────┐            │
│  │    User     │ │Preference │ │   Trip    │            │
│  │  Listener   │ │ Listener  │ │ Listener  │            │
│  └──────┬──────┘ └────┬──────┘ └────┬──────┘            │
│         │             │             │                     │
│  ┌──────▼─────────────▼─────────────▼──────┐            │
│  │         Side Effects (Async)             │            │
│  ├──────────────────────────────────────────┤            │
│  │  • Send Emails (Resend)                  │            │
│  │  • Update Analytics                      │            │
│  │  • Cache Invalidation                    │            │
│  │  • Push Notifications                    │            │
│  │  • Create Related Data                   │            │
│  └──────────────────────────────────────────┘            │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## Why Event-Driven? 🤔

### Problems with Direct Service Calls

❌ **Before (Tight Coupling):**
```typescript
// auth.service.ts
async register(data) {
  const user = await createUser(data);
  await emailService.sendWelcome(user.email);  // Direct dependency
  await preferenceService.createDefault(user.id);  // Direct dependency
  await analyticsService.track(user.id);  // Direct dependency
  return user;
}
```

**Issues:**
- Auth service knows about email, preferences, analytics
- Hard to test (need to mock all services)
- Can't add new features without modifying auth service
- If email fails, registration fails

### ✅ After (Event-Driven)

```typescript
// auth.service.ts
async register(data) {
  const user = await createUser(data);
  eventBus.emit(Events.USER_REGISTERED, { userId: user.id, email: user.email });
  return user;  // Registration succeeds immediately
}

// user.listener.ts (separate file)
eventBus.on(Events.USER_REGISTERED, async (data) => {
  await sendWelcomeEmail(data.email);
  await createDefaultPreferences(data.userId);
  await trackAnalytics(data.userId);
});
```

**Benefits:**
- Auth service only knows about user creation
- Easy to test (just check if event was emitted)
- Add new listeners without touching auth service
- Registration succeeds even if email fails

## Event Flow Example 📊

### User Registration Flow

```
1. Client → POST /api/auth/register
          ↓
2. AuthController.register()
          ↓
3. AuthService.register()
          ├─ Create user in DB
          ├─ Emit: USER_REGISTERED event ─────────┐
          └─ Return: { user, token }              │
                                                  │
4. ←─ Response sent to client                    │
                                                  │
5. Event System (async) ◄────────────────────────┘
          │
          ├─► user.listener: sendWelcomeEmail()
          ├─► user.listener: createDefaultPreferences()
          └─► user.listener: trackAnalytics()
```

## Events Catalog 📋

### User Events

| Event | Trigger | Listeners | Side Effects |
|-------|---------|-----------|--------------|
| `USER_REGISTERED` | User signs up | user.listener | • Send welcome email<br>• Create default preferences<br>• Track analytics |
| `USER_LOGGED_IN` | User logs in | user.listener | • Track login time<br>• Security checks<br>• Update last seen |

### Preference Events

| Event | Trigger | Listeners | Side Effects |
|-------|---------|-----------|--------------|
| `PREFERENCE_CREATED` | First-time preference setup | preference.listener | • Mark onboarding progress<br>• Generate initial recommendations |
| `PREFERENCE_UPDATED` | User changes preferences | preference.listener | • Invalidate cache<br>• Recalculate routes<br>• Notify mobile app |

### Location Events

| Event | Trigger | Listeners | Side Effects |
|-------|---------|-----------|--------------|
| `LOCATION_SAVED` | User adds location | preference.listener | • Track popular locations<br>• Generate route suggestions |
| `LOCATION_FAVORITED` | User favorites location | preference.listener | • Pre-generate common routes<br>• Send notification |

### Trip Events

| Event | Trigger | Listeners | Side Effects |
|-------|---------|-----------|--------------|
| `TRIP_COMPLETED` | Trip finishes | trip.listener | • Send trip summary email<br>• Update statistics<br>• Calculate savings<br>• Track popular routes |
| `TRIP_RATED` | User rates trip | trip.listener | • Update quality scores<br>• Improve recommendations |

## Code Structure 📁

```
backend/src/
├── events/
│   ├── eventBus.ts              # Central EventEmitter singleton
│   ├── eventTypes.ts            # Event names & payload interfaces
│   ├── index.ts                 # Public exports
│   └── listeners/
│       ├── user.listener.ts     # Handle user events
│       ├── preference.listener.ts  # Handle preference events
│       └── trip.listener.ts     # Handle trip events
├── services/
│   ├── auth.service.ts          # Emits: USER_REGISTERED, USER_LOGGED_IN
│   ├── preference.service.ts    # Emits: PREFERENCE_CREATED, PREFERENCE_UPDATED
│   └── location.service.ts      # Emits: LOCATION_SAVED, LOCATION_FAVORITED
└── server.ts                    # Imports listeners to register them
```

## Implementation Details 🔧

### 1. Event Bus (eventBus.ts)

```typescript
import { EventEmitter } from "events";

class EventBus extends EventEmitter {
  emitEvent<T>(event: string, data: T): boolean {
    console.log(`📡 Event emitted: ${event}`, data);
    return this.emit(event, data);
  }

  onEvent<T>(event: string, listener: (data: T) => void): this {
    return this.on(event, listener);
  }
}

export const eventBus = new EventBus();
```

### 2. Event Types (eventTypes.ts)

```typescript
export const Events = {
  USER_REGISTERED: "user.registered",
  PREFERENCE_UPDATED: "preference.updated",
  // ... more events
} as const;

export interface UserRegisteredPayload {
  userId: string;
  email: string;
  name: string;
  timestamp: Date;
}
```

### 3. Service Emits Event (auth.service.ts)

```typescript
import { eventBus, Events, UserRegisteredPayload } from "../events";

async register(data: RegisterDTO) {
  const user = await prisma.user.create({ data });
  
  // Emit event (fire and forget)
  const payload: UserRegisteredPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    timestamp: new Date(),
  };
  eventBus.emitEvent(Events.USER_REGISTERED, payload);
  
  return { user, token };
}
```

### 4. Listener Handles Event (user.listener.ts)

```typescript
import { eventBus, Events, UserRegisteredPayload } from "../events";
import { sendWelcomeEmail } from "../config/email";

eventBus.onEvent<UserRegisteredPayload>(
  Events.USER_REGISTERED,
  async (data) => {
    try {
      await sendWelcomeEmail(data.email, data.name);
      console.log(`✅ Welcome email sent to ${data.email}`);
    } catch (error) {
      console.error(`❌ Error sending email:`, error);
    }
  }
);
```

## Testing Strategy 🧪

### Testing Services (emit events)

```typescript
// auth.service.test.ts
const eventSpy = jest.spyOn(eventBus, 'emitEvent');

await authService.register({ email: 'test@test.com', ... });

expect(eventSpy).toHaveBeenCalledWith(
  Events.USER_REGISTERED,
  expect.objectContaining({ email: 'test@test.com' })
);
```

### Testing Listeners (handle events)

```typescript
// user.listener.test.ts
const emailSpy = jest.spyOn(emailService, 'sendWelcomeEmail');

eventBus.emitEvent(Events.USER_REGISTERED, {
  userId: '123',
  email: 'test@test.com',
  name: 'Test User',
  timestamp: new Date(),
});

await waitFor(() => {
  expect(emailSpy).toHaveBeenCalledWith('test@test.com', 'Test User');
});
```

## Scalability Path 🚀

### Phase 1: Current (Node.js EventEmitter)
- ✅ Good for single server
- ✅ Fast (in-memory)
- ❌ Can't scale horizontally

### Phase 2: Redis Pub/Sub
```typescript
// Replace EventEmitter with Redis
import Redis from 'ioredis';
const redis = new Redis();

// Emit
redis.publish('USER_REGISTERED', JSON.stringify(payload));

// Listen
redis.subscribe('USER_REGISTERED');
redis.on('message', (channel, message) => {
  const data = JSON.parse(message);
  handleUserRegistered(data);
});
```

### Phase 3: RabbitMQ / Kafka
- Full message queue with persistence
- Replay events
- Dead letter queues
- Multiple consumer groups

## Email Integration (Resend) 📧

### Setup

```bash
# Install
pnpm add resend

# Get API key from https://resend.com
RESEND_API_KEY=re_xxxxx
```

### Usage

```typescript
// config/email.ts
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (email: string, name: string) => {
  const { data, error } = await resend.emails.send({
    from: 'WayFinder <onboarding@wayfinder.app>',
    to: [email],
    subject: 'Welcome to WayFinder! 🚀',
    html: `<h1>Hi ${name}!</h1><p>Welcome to WayFinder...</p>`,
  });
  
  if (error) throw error;
  return data;
};
```

## Benefits Summary ✨

| Aspect | Benefit |
|--------|---------|
| **Decoupling** | Services don't know about each other |
| **Testability** | Easy to test in isolation |
| **Scalability** | Can move to Redis/RabbitMQ later |
| **Maintainability** | Add features without modifying existing code |
| **Reliability** | Failures in listeners don't affect main flow |
| **Performance** | Async processing doesn't block requests |

## Conclusion 🎓

This event-driven architecture demonstrates:

1. ✅ **Non-monolithic design** - Clear service boundaries
2. ✅ **Loose coupling** - No direct service dependencies
3. ✅ **Scalable** - Can grow to microservices easily
4. ✅ **Modern patterns** - Industry-standard Observer pattern
5. ✅ **Production-ready** - Proper error handling and logging

**Perfect for demonstrating advanced architecture in your final assessment!** 🎉

---

**Built with ❤️ for WayFinder** 🧭
