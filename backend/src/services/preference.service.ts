import {
  UpdatePreferenceDTO,
} from "../validators/preference.validator";
import { prisma } from "../config/database";
import { eventBus } from "../events/eventBus";
import { Events, PreferenceCreatedPayload, PreferenceUpdatedPayload } from "../events/eventTypes";

export class PreferenceService {
  // ===== PREFERENCES =====

  async createUserPreferences(userId: string, data: UpdatePreferenceDTO) {
    // Check if user exists first
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found. Cannot create preferences for non-existent user.");
    }

    //Check if user has existing preference
    const existing = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new Error("Preferences already exist!");
    }


    //create preferences
    const preferences = await prisma.userPreference.create({
      data: {
        userId,
        maxBudget: data.maxBudget ?? 1000, // Use provided or default
        preferredModes: data.preferredModes ?? [], // Use provided or empty
        avoidanceZones: data.avoidanceZones ?? [], // Use provided or empty
        priorityType: data.priorityType ?? "balanced",
        isComplete: (data as any).isComplete ?? false,
      },
      cacheStrategy: { ttl: 60, swr: 30 },
    });

    // 🎯 Emit PREFERENCE_CREATED event
    const eventPayload: PreferenceCreatedPayload = {
      userId,
      preferenceId: preferences.id,
      maxBudget: preferences.maxBudget,
      preferredModes: preferences.preferredModes,
      timestamp: new Date(),
    };
    eventBus.emitEvent(Events.PREFERENCE_CREATED, eventPayload);

    return preferences;
  }

  //get user preference
  async getUserPreferences(userId: string) {
    const preferences = await prisma.userPreference.findUnique({
      where: { userId },
      cacheStrategy: { ttl: 60, swr: 30 },
    });

    if (!preferences) {
      throw new Error("Preferences not found");
    }

    return preferences;
  }

  //update user preference
  async updateUserPreferences(
    userId: string,
    data: UpdatePreferenceDTO & { isComplete?: boolean }
  ) {
    const existingPrefs = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!existingPrefs) {
      throw new Error("Preferences not found! please add your preference");
    }

    const updated = await prisma.userPreference.update({
      where: { userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      cacheStrategy: { ttl: 60, swr: 30 },
    });

    // 🎯 Emit PREFERENCE_UPDATED event
    const eventPayload: PreferenceUpdatedPayload = {
      userId,
      preferenceId: updated.id,
      changes: data,
      timestamp: new Date(),
    };
    eventBus.emitEvent(Events.PREFERENCE_UPDATED, eventPayload);

    return updated;
  }

  //delete user preference
  async deleteUserPreference(userId: string) {
    const existingPrefs = await prisma.userPreference.findUnique({
      where: { userId },
    });
    if (!existingPrefs) {
      throw new Error("Preference not found!");
    }

    await prisma.userPreference.delete({
      where: { userId },
    });

    return {
      message: "Preference deleted successfully!",
    };
  }
}
