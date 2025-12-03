import {
  UpdatePreferenceDTO,
} from "../validators/preference.validator";
import { prisma } from "../config/database";

export class PreferenceService {
  // ===== PREFERENCES =====

  async createUserPreferences(userId: string, data: UpdatePreferenceDTO) {
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

    return preferences;
  }

  //get user preference
  async getUserPreferences(userId: string) {
    const preferences = await prisma.userPreference.findUnique({
      where: { userId },
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
