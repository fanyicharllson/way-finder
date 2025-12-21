import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useGetPreferences } from "@/hooks/usePreferences";
import { useFavorites } from "@/hooks/useFavorite";

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  onViewDetails,
  isDark,
}) => {
  const { data: preferences } = useGetPreferences();
  const { data: favorites } = useFavorites();

  // Get preferred mode from user preferences (first preference or default)
  const preferredMode = preferences?.preferredModes?.[0] || "BUS";
  
  // Get first favorite or use fallback
  const firstFavorite = favorites?.favorites?.[0];
  
  if (!firstFavorite) {
    return null; // Don't show if no favorites
  }

  const getModeIcon = (mode: string) => {
    const modeMap: { [key: string]: any } = {
      BUS: "bus",
      MOTO: "bicycle",
      TAXI: "car",
      WALK: "walk",
      CAR: "car",
      BIKE: "bicycle",
      TRAIN: "train",
      FERRY: "boat",
    };
    return modeMap[mode.toUpperCase()] || "bus";
  };

  const getModeName = (mode: string) => {
    return mode.charAt(0) + mode.slice(1).toLowerCase();
  };

  // Estimate cost and time based on mode
  const getEstimates = (mode: string) => {
    const estimates: { [key: string]: { cost: string; time: string } } = {
      BUS: { cost: "300 XAF", time: "25m" },
      MOTO: { cost: "500 XAF", time: "15m" },
      TAXI: { cost: "1000 XAF", time: "20m" },
      WALK: { cost: "0 XAF", time: "45m" },
      CAR: { cost: "800 XAF", time: "18m" },
      BIKE: { cost: "0 XAF", time: "30m" },
    };
    return estimates[mode.toUpperCase()] || estimates.BUS;
  };

  const estimates = getEstimates(preferredMode);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isDark && styles.labelDark]}>
        Based on your preferences
      </Text>

      <LinearGradient
        colors={["#3B82F6", "#2563EB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Route */}
        <View style={styles.routeContainer}>
          <View style={styles.routeSection}>
            <Text style={styles.routeLabel}>From</Text>
            <Text style={styles.routeText} numberOfLines={1}>
              {firstFavorite.fromAddress}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="white" />
          <View style={[styles.routeSection, styles.routeSectionEnd]}>
            <Text style={styles.routeLabel}>To</Text>
            <Text style={styles.routeText} numberOfLines={1}>
              {firstFavorite.toAddress}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.modeSection}>
            <View style={styles.modeIconContainer}>
              <Ionicons
                name={getModeIcon(preferredMode)}
                size={20}
                color="white"
              />
            </View>
            <Text style={styles.modeText}>
              {getModeName(preferredMode)}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Cost</Text>
              <Text style={styles.statValue}>{estimates.cost}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Time</Text>
              <Text style={styles.statValue}>{estimates.time}</Text>
            </View>
          </View>
        </View>

        {/* View Details Button */}
        <TouchableOpacity
          onPress={onViewDetails}
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    marginBottom: 24,
  },
  label: {
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 12,
    fontWeight: "500",
  },
  labelDark: {
    color: "#9CA3AF",
  },
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  routeSection: {
    flex: 1,
  },
  routeSectionEnd: {
    alignItems: "flex-end",
  },
  routeLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    marginBottom: 4,
  },
  routeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  modeSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  modeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  modeText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 12,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    alignItems: "flex-end",
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
  },
  statValue: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  button: {
    backgroundColor: "#FFFFFF",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#2563EB",
    fontWeight: "bold",
    fontSize: 16,
  },
});
