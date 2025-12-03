import {
  CreateLocationDTO,
  UpdateLocationDTO,
} from "../validators/preference.validator";
import { prisma } from "../config/database";

export class LocationService {
  // ===== LOCATIONS =====

  async getUserLocations(userId: string) {
    const locations = await prisma.location.findMany({
      where: { userId },
      orderBy: [{ isFavorite: "desc" }, { createdAt: "desc" }],
    });

    return locations;
  }

  async getLocationById(userId: string, locationId: string) {
    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
        userId,
      },
    });

    if (!location) {
      throw new Error("Location not found");
    }

    return location;
  }

  async createLocation(userId: string, data: CreateLocationDTO) {
    // Check if location name already exists for this user
    const existing = await prisma.location.findFirst({
      where: {
        userId,
        name: data.name,
      },
    });

    if (existing) {
      throw new Error("Location with this name already exists");
    }

    const location = await prisma.location.create({
      data: {
        userId,
        ...data,
      },
    });

    return location;
  }

  async updateLocation(
    userId: string,
    locationId: string,
    data: UpdateLocationDTO
  ) {
    // Verify ownership
    const existing = await this.getLocationById(userId, locationId);

    // If updating name, check for duplicates
    if (data.name && data.name !== existing.name) {
      const duplicate = await prisma.location.findFirst({
        where: {
          userId,
          name: data.name,
          id: { not: locationId },
        },
      });

      if (duplicate) {
        throw new Error("Location with this name already exists");
      }
    }

    const updated = await prisma.location.update({
      where: { id: locationId },
      data,
    });

    return updated;
  }

  async deleteLocation(userId: string, locationId: string) {
    // Verify ownership
    await this.getLocationById(userId, locationId);

    await prisma.location.delete({
      where: { id: locationId },
    });

    return { message: "Location deleted successfully" };
  }

  async getFavoriteLocations(userId: string) {
    const favorites = await prisma.location.findMany({
      where: {
        userId,
        isFavorite: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return favorites;
  }
}
