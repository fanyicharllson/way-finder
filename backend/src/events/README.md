# Event-Driven Architecture 🎯

This directory contains the event-driven architecture implementation for WayFinder.

## Overview

The event system uses the **Observer Pattern** (Pub/Sub) to decouple services and enable asynchronous processing of side effects without tight coupling between components.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Event Flow                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Service Layer          Event Bus         Listeners │
│  ──────────────         ─────────         ─────────│
│                                                     │
│  auth.service  ──emit──> EventBus ──on──> user.listener   │
│                          (central)        preference.listener│
│  preference.service ──┐                   trip.listener    │
│  location.service   ──┤                                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Directory Structure

```
events/
├── eventBus.ts              # Central event emitter (singleton)
├── eventTypes.ts            # Event names and payload interfaces
├── index.ts                 # Public exports
└── listeners/
    ├── user.listener.ts     # User-related event handlers
    ├── preference.listener.ts  # Preference event handlers
    └── trip.listener.ts     # Trip event handlers
```

## Key Benefits ✅

1. **Loose Coupling**: Services don't depend on each other directly
2. **Scalability**: Easy to add new features without modifying existing code
3. **Maintainability**: Each listener is independent and testable
4. **Future-Ready**: Can easily migrate to Redis Pub/Sub or RabbitMQ
5. **Async Processing**: Side effects don't block main operations

## Events Available

### User Events
- `USER_REGISTERED` - When a new user signs up
- `USER_LOGGED_IN` - When a user logs in

### Preference Events
- `PREFERENCE_CREATED` - When preferences are first created
- `PREFERENCE_UPDATED` - When preferences are modified

### Location Events
- `LOCATION_SAVED` - When a location is saved
- `LOCATION_FAVORITED` - When a location is marked as favorite

### Trip Events
- `TRIP_STARTED` - When a trip begins
- `TRIP_COMPLETED` - When a trip is finished
- `TRIP_RATED` - When a user rates a trip

## Usage Example

### Emitting Events (in services)

```typescript
import { eventBus, Events, UserRegisteredPayload } from "../events";

// In auth.service.ts
const payload: UserRegisteredPayload = {
  userId: user.id,
  email: user.email,
  name: user.name,
  timestamp: new Date(),
};

eventBus.emitEvent(Events.USER_REGISTERED, payload);
```

### Listening to Events (in listeners)

```typescript
import { eventBus, Events, UserRegisteredPayload } from "../events";

eventBus.onEvent<UserRegisteredPayload>(
  Events.USER_REGISTERED,
  async (data) => {
    // Handle the event
    await sendWelcomeEmail(data.email, data.name);
    console.log(`✅ Welcome email sent to ${data.email}`);
  }
);
```

## Current Implementations

### user.listener.ts
- Sends welcome email on registration
- Creates default preferences
- Tracks login analytics

### preference.listener.ts
- Invalidates cache when preferences change
- Logs analytics for preference updates

### trip.listener.ts
- Sends trip summary emails
- Calculates savings
- Updates user statistics

## Future Enhancements 🚀

1. **Redis Pub/Sub**: Scale across multiple server instances
2. **Event Replay**: Rebuild state from event history
3. **Dead Letter Queue**: Handle failed event processing
4. **Event Store**: Persist events for auditing
5. **Webhooks**: Notify external services of events

## Testing

Each listener can be tested independently:

```typescript
// Test user.listener.ts
eventBus.emitEvent(Events.USER_REGISTERED, {
  userId: "test-id",
  email: "test@example.com",
  name: "Test User",
  timestamp: new Date(),
});
```

## Migration Path to Microservices

This event system makes it easy to migrate to microservices later:

1. Replace `EventEmitter` with Redis Pub/Sub or RabbitMQ
2. Move listeners to separate services
3. No changes needed to services that emit events!

---

**Built for WayFinder** 🧭 | Event-Driven Architecture
