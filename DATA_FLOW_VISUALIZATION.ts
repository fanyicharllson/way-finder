/**
 * DATA FLOW VISUALIZATION
 * 
 * See EXACTLY how data flows from emit() to listener callback
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THE MOMENT OF EMISSION & DATA PASSING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// In auth.service.ts, we create the payload:
const eventPayload = {
  userId: "123e4567-e89b-12d3-a456-426614174000",
  email: "john@example.com",
  name: "John Doe",
  timestamp: new Date(),
};
//              ↓
//              ↓  This exact object is passed to emit()
//              ↓

eventBus.emitEvent(Events.USER_REGISTERED, eventPayload);
//                                          ↑
//                              This is the data parameter

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INSIDE eventBus.emitEvent()
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// eventBus.ts
emitEvent<T>(event: string, data: T): boolean {
  //           ↑ event = "user.registered"
  //                     ↑ data = { userId, email, name, timestamp }
  
  console.log(`📡 Event emitted: ${event}`, data);
  //                                         ↑
  //                        This logs the actual data
  
  return this.emit(event, data);
  //                        ↑ Still passing the same data object
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INSIDE Node.js EventEmitter.emit()
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// This is what happens inside the EventEmitter class:
emit(eventName: string, data: any): boolean {
  //        ↑ "user.registered"
  //                          ↑ { userId, email, name, timestamp }
  
  // Step 1: Look up all listeners for this event name
  const listeners = this.listeners[eventName];
  // listeners = this.listeners["user.registered"]
  // listeners = [
  //   async (data) => {
  //     await sendWelcomeEmail(data.email, data.name)
  //   }
  // ]
  
  // Step 2: Call each listener with the data
  listeners.forEach((listener) => {
    listener(data);
    //      ↑ The magic! Passing data to the callback
    //        listener = async (data) => { ... }
    //        So this becomes:
    //        async (data) => { ... }({ userId, email, name, timestamp })
  });
  
  return true;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THE CALLBACK RECEIVES THE DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// In user.listener.ts:
eventBus.onEvent<UserRegisteredPayload>(
  Events.USER_REGISTERED,
  async (data) => {  // ← This parameter receives the payload!
    //   ↑ data = { userId, email, name, timestamp }
    
    console.log(data);
    // Logs: { 
    //   userId: "123e4567-e89b-12d3-a456-426614174000",
    //   email: "john@example.com",
    //   name: "John Doe",
    //   timestamp: 2025-12-04T10:30:00.000Z
    // }
    
    // Now use it:
    console.log(data.email);  // "john@example.com"
    console.log(data.name);   // "John Doe"
    console.log(data.userId); // "123e4567-..."
    
    await sendWelcomeEmail(data.email, data.name);
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SIDE-BY-SIDE COMPARISON: emit() → listener
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// What we send:
const payload = {
  userId: "123e4567-e89b-12d3-a456-426614174000",
  email: "john@example.com",
  name: "John Doe",
  timestamp: new Date(),
};

eventBus.emitEvent(Events.USER_REGISTERED, payload);
//                                          ↑
//                                    Send this

// What listener receives:
eventBus.onEvent<UserRegisteredPayload>(
  Events.USER_REGISTERED,
  async (data) => {
    // data = {
    //   userId: "123e4567-e89b-12d3-a456-426614174000",
    //   email: "john@example.com",
    //   name: "John Doe",
    //   timestamp: 2025-12-04T10:30:00.000Z
    // }
    //
    // EXACTLY THE SAME OBJECT!
  }
);
//                  ↑
//            Receive this

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOW EventEmitter DOES THIS INTERNALLY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Simplified Node.js EventEmitter implementation:

class EventEmitter {
  private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();

  on(eventName: string, callback: (...args: any[]) => void): this {
    // Register a listener
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)!.push(callback);
    //                               ↑
    //                    Store the callback function
    return this;
  }

  emit(eventName: string, ...args: any[]): boolean {
    // Emit an event
    const callbacks = this.listeners.get(eventName);
    
    if (!callbacks) {
      return false;
    }

    callbacks.forEach((callback) => {
      callback(...args);
      //      ↑ Call the callback with the data!
      // If args = [{ userId, email, name, timestamp }]
      // Then: callback({ userId, email, name, timestamp })
    });

    return true;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONCRETE EXAMPLE WITH EXECUTION TRACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// START
const eventBus = new EventEmitter();

// STEP 1: Register listener
console.log("Step 1: Registering listener");
eventBus.on("user.registered", async (data) => {
  console.log("Listener called with:", data);
  console.log("Email:", data.email);
});

// After this step:
// eventBus.listeners = {
//   "user.registered": [
//     async (data) => {
//       console.log("Listener called with:", data);
//       console.log("Email:", data.email);
//     }
//   ]
// }

console.log("✅ Listener registered\n");

// STEP 2: Emit event with data
console.log("Step 2: Emitting event");
const userData = {
  userId: "user123",
  email: "john@example.com",
  name: "John Doe",
  timestamp: new Date(),
};

eventBus.emit("user.registered", userData);
//                                ↑
//                    Passes this data to all listeners

// STEP 3: Inside emit(), for each listener:
// listeners.forEach((callback) => {
//   callback(userData)
// })
//
// So the callback is invoked like:
// async (data) => {
//   console.log("Listener called with:", data)
//   console.log("Email:", data.email)
// }(userData)
//
// Which means:
// - data parameter = userData
// - data.email = "john@example.com"

console.log("\n✅ Event emitted and listeners called");

// CONSOLE OUTPUT:
// Step 1: Registering listener
// ✅ Listener registered
//
// Step 2: Emitting event
// Listener called with: { userId: 'user123', email: 'john@example.com', name: 'John Doe', timestamp: 2025-12-04T... }
// Email: john@example.com
//
// ✅ Event emitted and listeners called

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANSWERING YOUR SPECIFIC QUESTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/*

Q1: Why EventEmitter from 'events'?
A: EventEmitter is a built-in Node.js class that:
   - Has an internal dictionary to store listeners
   - Provides .on() method to register listeners
   - Provides .emit() method to trigger listeners
   - Automatically passes data to all listeners
   
   Without it, you'd have to write all that logic yourself!

Q2: How does the event data get to the listener?
A: Through JavaScript function parameters!
   
   When you do: eventBus.emitEvent(name, payload)
   
   It calls: this.emit(name, payload)
   
   Which internally does: callback(payload)
   
   So the listener receives payload as its data parameter:
   async (data) => { ... }(payload)
                ↑ data = payload!

Q3: Is it the EventEmitter that passes the data?
A: YES! Exactly!
   
   import { EventEmitter } from "events"
   extends EventEmitter
   
   The emit() method in EventEmitter is responsible for:
   1. Finding all registered listeners (callbacks)
   2. Calling each with: callback(data)
   3. Passing the exact data you provided
   
   Your code just calls emit() with the data,
   EventEmitter handles everything else!

*/

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THE COMPLETE PICTURE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log(`
╔════════════════════════════════════════════════════════════╗
║              THE DATA PASSING MECHANISM                     ║
╚════════════════════════════════════════════════════════════╝

YOUR CODE:
──────────
authService:
  const payload = { userId, email, name, timestamp }
  eventBus.emitEvent("user.registered", payload)
                                        ↑ Pass data here

EVENTEMITTER HANDLES:
────────────────────
  eventBus.emit("user.registered", payload)
  
  listeners = this.listeners["user.registered"]
  // Get all callbacks registered for this event
  
  listeners.forEach(callback => {
    callback(payload)  ← CALL EACH WITH THE DATA!
  })

LISTENER RECEIVES:
──────────────────
userListener:
  async (data) => {
    // data parameter = the payload!
    // data.userId = "123..."
    // data.email = "john@example.com"
    // etc.
  }

FLOW:
─────
emit() → finds callbacks → calls callback(data) → listener(data) ✅

`);

export {};
