import { EventEmitter } from "events";

/**
 * Central Event Bus for the application
 * Uses Node.js EventEmitter for publish-subscribe pattern
 * This allows services to communicate without direct dependencies
 */
class EventBus extends EventEmitter {
  constructor() {
    super();
    // Increase max listeners to prevent memory leak warnings
    this.setMaxListeners(20);
  }

  /**
   * Emit an event with type safety
   */
  emitEvent<T>(event: string, data: T): boolean {
    console.log(`📡 Event emitted: ${event}`, data);
    return this.emit(event, data);
  }

  /**
   * Subscribe to an event with type safety
   */
  onEvent<T>(event: string, listener: (data: T) => void | Promise<void>): this {
    return this.on(event, listener);
  }
}

// Singleton instance
export const eventBus = new EventBus();
