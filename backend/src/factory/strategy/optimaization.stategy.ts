import {
  RouteOption,
  OptimizationType,
  RecommendationBadge,
} from "../../types/route.type";

/**
 * Optimization Strategy Interface (Strategy Pattern)
 */
export interface OptimizationStrategy {
  optimize(routes: RouteOption[]): RouteOption[];
  getName(): OptimizationType;
}

/**
 * Fastest Strategy
 * Prioritizes routes with shortest duration
 */
export class FastestStrategy implements OptimizationStrategy {
  optimize(routes: RouteOption[]): RouteOption[] {
    // Sort by duration (ascending)
    const sorted = [...routes].sort((a, b) => a.duration - b.duration);

    // Mark the fastest route
    if (sorted.length > 0) {
      sorted[0].recommendation = "fastest";
    }

    return sorted;
  }

  getName(): OptimizationType {
    return OptimizationType.FASTEST;
  }
}

/**
 * Cheapest Strategy
 * Prioritizes routes with lowest cost
 */
export class CheapestStrategy implements OptimizationStrategy {
  optimize(routes: RouteOption[]): RouteOption[] {
    // Sort by cost (ascending)
    const sorted = [...routes].sort((a, b) => a.cost - b.cost);

    // Mark the cheapest route
    if (sorted.length > 0) {
      sorted[0].recommendation = "cheapest";
    }

    return sorted;
  }

  getName(): OptimizationType {
    return OptimizationType.CHEAPEST;
  }
}

/**
 * Balanced Strategy
 * Finds best trade-off between cost and time
 * Uses a weighted scoring system
 */
export class BalancedStrategy implements OptimizationStrategy {
  private readonly COST_WEIGHT = 0.4; // 40% weight on cost
  private readonly TIME_WEIGHT = 0.6; // 60% weight on time

  optimize(routes: RouteOption[]): RouteOption[] {
    if (routes.length === 0) return routes;

    // Find min/max values for normalization
    const costs = routes.map((r) => r.cost);
    const durations = routes.map((r) => r.duration);

    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    // Calculate balanced scores for each route
    const scoredRoutes = routes.map((route) => {
      // Normalize cost and duration to 0-1 scale
      const normalizedCost =
        maxCost - minCost > 0
          ? (route.cost - minCost) / (maxCost - minCost)
          : 0;

      const normalizedDuration =
        maxDuration - minDuration > 0
          ? (route.duration - minDuration) / (maxDuration - minDuration)
          : 0;

      // Calculate weighted score (lower is better)
      const score =
        normalizedCost * this.COST_WEIGHT +
        normalizedDuration * this.TIME_WEIGHT;

      return { route, score };
    });

    // Sort by score (ascending - lower score is better)
    const sorted = scoredRoutes
      .sort((a, b) => a.score - b.score)
      .map((item) => item.route);

    // Mark the best balanced route
    if (sorted.length > 0) {
      sorted[0].recommendation = "best-value";
    }

    return sorted;
  }

  getName(): OptimizationType {
    return OptimizationType.BALANCED;
  }
}

/**
 * Strategy Factory
 * Creates appropriate strategy based on optimization type
 */
export class StrategyFactory {
  private static strategies: Map<OptimizationType, OptimizationStrategy> =
    new Map([
      [OptimizationType.FASTEST, new FastestStrategy()],
      [OptimizationType.CHEAPEST, new CheapestStrategy()],
      [OptimizationType.BALANCED, new BalancedStrategy()],
    ]);

  static getStrategy(type: OptimizationType): OptimizationStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      // Fallback to balanced if unknown type
      console.warn(`Unknown optimization type: ${type}, using BALANCED`);
      return this.strategies.get(OptimizationType.BALANCED)!;
    }
    return strategy;
  }
}