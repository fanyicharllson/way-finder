/**
 * Event System Index
 * 
 * Central export point for the event-driven architecture
 */

export { eventBus } from "./eventBus";
export { Events } from "./eventTypes";
export type {
  UserRegisteredPayload,
  UserLoggedInPayload,
  PreferenceCreatedPayload,
  PreferenceUpdatedPayload,
  LocationSavedPayload,
  TripCompletedPayload,
  TripRatedPayload,
} from "./eventTypes";
