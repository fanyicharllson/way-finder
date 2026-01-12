import { prisma } from "../src/config/database";

/**
 * Seed pricing data for transport modes
 * Based on realistic Cameroon pricing for inter-city travel
 */
async function seedPricingData() {
  console.log("🌱 Seeding pricing data...");

  try {
    // 1. Seed base transport pricing configurations
    console.log("📊 Creating base transport pricing...");
    
    await prisma.transportPricing.createMany({
      data: [
        {
          mode: "bus",
          baseFare: 1000,
          costPerKm: 8,
          averageSpeed: 50,
          comfortLevel: 3,
          weatherSensitive: false,
          trafficSensitive: true,
          minDistance: 10,
          maxDistance: null,
          peakHourMultiplier: 1.2,
          offPeakMultiplier: 0.9,
          isActive: true,
        },
        {
          mode: "moto",
          baseFare: 500,
          costPerKm: 20,
          averageSpeed: 60,
          comfortLevel: 2,
          weatherSensitive: true,
          trafficSensitive: true,
          minDistance: 5,
          maxDistance: 100,
          peakHourMultiplier: 1.5,
          offPeakMultiplier: 1.0,
          weatherMultiplier: 1.3,
          isActive: true,
        },
        {
          mode: "taxi",
          baseFare: 2000,
          costPerKm: 25,
          averageSpeed: 55,
          comfortLevel: 5,
          weatherSensitive: false,
          trafficSensitive: true,
          minDistance: 5,
          maxDistance: null,
          peakHourMultiplier: 1.3,
          offPeakMultiplier: 1.0,
          isActive: true,
        },
        {
          mode: "walking",
          baseFare: 0,
          costPerKm: 0,
          averageSpeed: 5,
          comfortLevel: 3,
          weatherSensitive: true,
          trafficSensitive: false,
          minDistance: 0,
          maxDistance: 10,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });

    console.log("✅ Base transport pricing created");

    // 2. Seed surge pricing rules (rush hours)
    console.log("⏰ Creating surge pricing rules...");

    const surgeRules = [];

    // Morning rush hour (Mon-Fri, 7-9 AM)
    for (let day = 1; day <= 5; day++) {
      surgeRules.push(
        {
          mode: "taxi",
          dayOfWeek: day,
          startHour: 7,
          endHour: 9,
          multiplier: 1.5,
          description: "Morning rush hour",
          isActive: true,
        },
        {
          mode: "moto",
          dayOfWeek: day,
          startHour: 7,
          endHour: 9,
          multiplier: 1.4,
          description: "Morning rush hour",
          isActive: true,
        },
        {
          mode: "bus",
          dayOfWeek: day,
          startHour: 7,
          endHour: 9,
          multiplier: 1.2,
          description: "Morning rush hour",
          isActive: true,
        }
      );
    }

    // Evening rush hour (Mon-Fri, 5-7 PM)
    for (let day = 1; day <= 5; day++) {
      surgeRules.push(
        {
          mode: "taxi",
          dayOfWeek: day,
          startHour: 17,
          endHour: 19,
          multiplier: 1.5,
          description: "Evening rush hour",
          isActive: true,
        },
        {
          mode: "moto",
          dayOfWeek: day,
          startHour: 17,
          endHour: 19,
          multiplier: 1.4,
          description: "Evening rush hour",
          isActive: true,
        },
        {
          mode: "bus",
          dayOfWeek: day,
          startHour: 17,
          endHour: 19,
          multiplier: 1.2,
          description: "Evening rush hour",
          isActive: true,
        }
      );
    }

    // Late night premium (All days, 10 PM - 5 AM)
    for (let day = 0; day <= 6; day++) {
      surgeRules.push(
        {
          mode: "taxi",
          dayOfWeek: day,
          startHour: 22,
          endHour: 23,
          multiplier: 1.3,
          description: "Late night premium",
          isActive: true,
        },
        {
          mode: "taxi",
          dayOfWeek: day,
          startHour: 0,
          endHour: 5,
          multiplier: 1.3,
          description: "Late night premium",
          isActive: true,
        }
      );
    }

    await prisma.surgePricingRule.createMany({
      data: surgeRules,
      skipDuplicates: true,
    });

    console.log(`✅ ${surgeRules.length} surge pricing rules created`);

    // 3. Seed weather pricing rules
    console.log("🌧️ Creating weather pricing rules...");

    await prisma.weatherPricingRule.createMany({
      data: [
        // Moto is heavily affected by rain
        {
          mode: "moto",
          weatherCondition: "rain",
          multiplier: 1.3,
          isActive: true,
        },
        {
          mode: "moto",
          weatherCondition: "heavy_rain",
          multiplier: 1.5,
          isActive: true,
        },
        {
          mode: "moto",
          weatherCondition: "storm",
          multiplier: 2.0, // Double price in storm
          isActive: true,
        },
        // Walking is moderately affected
        {
          mode: "walking",
          weatherCondition: "rain",
          multiplier: 1.2,
          isActive: true,
        },
        {
          mode: "walking",
          weatherCondition: "heavy_rain",
          multiplier: 1.5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });

    console.log("✅ Weather pricing rules created");

    // 4. Seed traffic pricing rules
    console.log("🚗 Creating traffic pricing rules...");

    await prisma.trafficPricingRule.createMany({
      data: [
        // Bus
        {
          mode: "bus",
          trafficLevel: "low",
          multiplier: 1.0,
          isActive: true,
        },
        {
          mode: "bus",
          trafficLevel: "moderate",
          multiplier: 1.1,
          isActive: true,
        },
        {
          mode: "bus",
          trafficLevel: "high",
          multiplier: 1.2,
          isActive: true,
        },
        // Moto
        {
          mode: "moto",
          trafficLevel: "low",
          multiplier: 1.0,
          isActive: true,
        },
        {
          mode: "moto",
          trafficLevel: "moderate",
          multiplier: 1.15,
          isActive: true,
        },
        {
          mode: "moto",
          trafficLevel: "high",
          multiplier: 1.3,
          isActive: true,
        },
        // Taxi
        {
          mode: "taxi",
          trafficLevel: "low",
          multiplier: 1.0,
          isActive: true,
        },
        {
          mode: "taxi",
          trafficLevel: "moderate",
          multiplier: 1.1,
          isActive: true,
        },
        {
          mode: "taxi",
          trafficLevel: "high",
          multiplier: 1.25,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });

    console.log("✅ Traffic pricing rules created");

    console.log("\n✨ Pricing data seeded successfully!");
    console.log("\n📋 Summary:");
    console.log("   - 4 transport modes configured");
    console.log(`   - ${surgeRules.length} surge pricing rules`);
    console.log("   - 5 weather pricing rules");
    console.log("   - 12 traffic pricing rules");
    console.log("\n🚀 Your app is now using dynamic pricing!");
  } catch (error) {
    console.error("❌ Error seeding pricing data:", error);
    throw error;
  }
}

async function main() {
  await seedPricingData();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
