# Quick Reference: EventEmitter Data Flow 🚀

## The One-Sentence Explanation

**EventEmitter is a JavaScript class that stores callback functions and calls all of them with the same data when you emit an event.**

---

## The 30-Second Version

```
1. LISTENER REGISTRATION:
   eventBus.on("event-name", (data) => { /* callback */ })
   
   What happens: Function is stored in an internal dictionary
   listeners["event-name"] = [(data) => { /* callback */ }]

2. EMIT EVENT:
   eventBus.emit("event-name", { actual: "data" })
   
   What happens: EventEmitter finds all stored functions and calls them

3. DATA PASSING:
   callback({ actual: "data" })
                  ↑ The exact data you passed to emit()
   
4. LISTENER RECEIVES:
   (data) => {
      data.actual = "data"  ✅ Same object!
   }
```

---

## How Data Gets From emit() to listener

### The Simple Path

```
You write:
  eventBus.emit("USER_REGISTERED", { userId: "123", email: "john@..." })

EventEmitter does internally:
  callback({ userId: "123", email: "john@..." })
            ↑ Passes as parameter

Listener receives:
  (data) => {
     data.userId = "123"
     data.email = "john@..."
  }
```

### The Technical Path

```
Service Layer:
  const payload = { userId, email, name, timestamp }
  eventBus.emitEvent(Events.USER_REGISTERED, payload)
           ↓
EventBus.emitEvent():
  return this.emit(event, data)
                          ↓
EventEmitter.emit():
  const listeners = this.listeners[event]
  listeners.forEach(callback => callback(data))
                                           ↑
                                    DATA PASSES HERE!
           ↓
Listener Receives:
  async (data) => { /* data = payload */ }
```

---

## Code Comparison: With vs Without EventEmitter

### Without EventEmitter ❌

```typescript
// You have to handle everything manually
class EventBus {
  private listeners = {};

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        callback(data);  // YOU have to write this!
      });
    }
  }
}
```

### With EventEmitter ✅

```typescript
import { EventEmitter } from "events";

class EventBus extends EventEmitter {
  emitEvent(event, data) {
    return this.emit(event, data);  // Node.js handles it!
  }

  onEvent(event, callback) {
    return this.on(event, callback);  // Node.js handles it!
  }
}
```

---

## Your Exact Code Flow

### 1. Registration (user.listener.ts)
```typescript
eventBus.onEvent<UserRegisteredPayload>(
  Events.USER_REGISTERED,
  async (data) => {
    await sendWelcomeEmail(data.email, data.name);
  }
);
// EventBus stores: listeners["user.registered"] = [async (data) => {...}]
```

### 2. Emission (auth.service.ts)
```typescript
const eventPayload: UserRegisteredPayload = {
  userId: user.id,
  email: user.email,
  name: user.name,
  timestamp: new Date(),
};

eventBus.emitEvent(Events.USER_REGISTERED, eventPayload);
//                                          ↑ Data passed here
```

### 3. Inside EventBus.emitEvent()
```typescript
emitEvent<T>(event: string, data: T): boolean {
  console.log(`📡 Event emitted: ${event}`, data);
  return this.emit(event, data);  // Passes data!
}
```

### 4. Inside Node.js EventEmitter.emit()
```typescript
// Pseudocode of what happens internally
emit(event, data) {
  const callbacks = this.listeners[event];
  callbacks.forEach(callback => {
    callback(data);  // ← DATA PASSED TO CALLBACK!
  });
}
```

### 5. Listener Executes
```typescript
// The callback is called with the data:
async (data) => {
  // data parameter receives the exact payload:
  // {
  //   userId: "123...",
  //   email: "john@example.com",
  //   name: "John Doe",
  //   timestamp: 2025-12-04T10:30:00Z
  // }
  
  await sendWelcomeEmail(data.email, data.name);
  //                      ↑ Access properties!
}
```

---

## Why It's Important

| Without Event System | With Event System |
|---|---|
| ❌ Service knows about email | ✅ Service just emits |
| ❌ Service knows about preferences | ✅ Listeners handle side effects |
| ❌ Service knows about analytics | ✅ Fully decoupled |
| ❌ If email fails, registration fails | ✅ Email failures don't block registration |
| ❌ Hard to add new features | ✅ Just add a new listener |

---

## Memory Model

```
When you write:
eventBus.onEvent("user.registered", callback)

What's stored in memory:
┌─────────────────────────────────┐
│ EventBus instance               │
├─────────────────────────────────┤
│ listeners: {                    │
│   "user.registered": [          │
│     ┌─────────────────────────┐ │
│     │ async (data) => {       │ │ ← Callback function
│     │   sendWelcomeEmail(...) │ │    stored in memory
│     │ }                       │ │
│     └─────────────────────────┘ │
│   ]                             │
│ }                               │
└─────────────────────────────────┘

When you write:
eventBus.emit("user.registered", payload)

What happens in memory:
1. Find callbacks = listeners["user.registered"]
2. For each callback:
   callback(payload)  ← Function called with data!
3. Listener receives data as parameter
```

---

## The Magic Line

```typescript
listeners.forEach(callback => {
  callback(data);  // ← THIS IS THE MAGIC!
              ↑
      Data passed as parameter to the function
```

This single line is responsible for passing data from `emit()` to the listener!

---

## Common Misconceptions

### ❌ "Where does the data go?"
### ✅ It's passed as a function parameter!
```typescript
// emit() calls the callback with data as the first argument
callback(data);

// So the listener receives it:
(data) => { console.log(data) }
 ↑ This parameter = the data from emit()
```

### ❌ "How does EventEmitter know the structure?"
### ✅ It doesn't! It just passes any JavaScript value
```typescript
// You can emit any data:
eventBus.emit("event1", { a: 1 })
eventBus.emit("event2", [1, 2, 3])
eventBus.emit("event3", "string")
eventBus.emit("event4", 42)

// Whatever you emit, listeners receive
(data) => {
  // data = whatever was emitted
}
```

### ❌ "The listener gets a copy?"
### ✅ No! It gets the SAME object reference
```typescript
const payload = { userId: "123" };
eventBus.emit("event", payload);

// Listener gets the same object:
(data) => {
  data === payload  // true! Same reference!
}
```

---

## Timeline

```
T=0ms:    app.listen(3000)
T=1ms:    import user.listener.ts
T=2ms:    eventBus.on("user.registered", callback)
T=3ms:    listeners["user.registered"] = [callback]
T=10ms:   POST /api/auth/register
T=20ms:   authService.register()
T=30ms:   create payload = { userId, email, ... }
T=31ms:   eventBus.emit("user.registered", payload)
T=32ms:   EventEmitter.emit() finds callbacks
T=33ms:   EventEmitter calls: callback(payload)
T=34ms:   Listener starts: async (data) => { ... }
T=35ms:   Listener accesses: data.email, data.userId
T=40ms:   Response sent to client (no wait!)
T=100ms:  Listener finishes (async continues in background)
```

---

## One More Time, Simplified

```
What is EventEmitter?
→ A JavaScript class that stores functions

How does it work?
→ .on() stores, .emit() calls

How is data passed?
→ Through function parameters: callback(data)

Your flow:
1. emit("event", data)
2. EventEmitter finds listeners
3. EventEmitter calls: listener(data)
4. Listener receives data as parameter
5. Done!
```

---

## You Now Know Everything! 🎓

- ✅ EventEmitter stores listeners
- ✅ emit() triggers all listeners
- ✅ Data is passed as function parameters
- ✅ Callback receives: `(data) => { ... }`
- ✅ Simple, elegant, powerful!

**The magic is Node.js doing the work for you!** ✨
