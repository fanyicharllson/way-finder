import {
  CreateLocationDTO,
  UpdateLocationDTO,
} from "../validators/preference.validator";
import { prisma } from "../config/database";
import { eventBus } from "../events/eventBus";
import { Events, LocationSavedPayload } from "../events/eventTypes";

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

    // 🎯 Emit LOCATION_SAVED event
    const eventPayload: LocationSavedPayload = {
      userId,
      locationId: location.id,
      name: location.name,
      address: location.address,
      isFavorite: location.isFavorite,
      timestamp: new Date(),
    };
    eventBus.emitEvent(Events.LOCATION_SAVED, eventPayload);

    // If it's a favorite, emit additional event
    if (location.isFavorite) {
      eventBus.emitEvent(Events.LOCATION_FAVORITED, eventPayload);
    }

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

    // 🎯 Emit event if favorited status changed
    if (data.isFavorite !== undefined && data.isFavorite !== existing.isFavorite) {
      const eventPayload: LocationSavedPayload = {
        userId,
        locationId: updated.id,
        name: updated.name,
        address: updated.address,
        isFavorite: updated.isFavorite,
        timestamp: new Date(),
      };
      
      if (updated.isFavorite) {
        eventBus.emitEvent(Events.LOCATION_FAVORITED, eventPayload);
      }
    }

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
