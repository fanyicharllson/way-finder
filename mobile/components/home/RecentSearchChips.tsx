import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRecentSearches } from "@/hooks/useRecentSearch";

interface RecentSearchChipsProps {
  onSelect: (from: string, to: string) => void;
  isDark: boolean;
}

const fallbackSuggestions = [
  { from: "Yaoundé", to: "Douala" },
  { from: "Yaoundé", to: "Bafoussam" },
  { from: "Douala", to: "Buea" },
  { from: "Yaoundé", to: "Kribi" },
  { from: "Bamenda", to: "Douala" },
];

const Chip: React.FC<{ label: string; onPress: () => void; isDark: boolean }> = ({
  label,
  onPress,
  isDark,
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    className={`mr-2 mb-2 px-3 py-2 rounded-full border flex-row items-center ${
      isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
    }`}
    style={{ shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
  >
    <Ionicons
      name="time-outline"
      size={14}
      color={isDark ? "#9CA3AF" : "#6B7280"}
      style={{ marginRight: 6 }}
    />
    <Text className={isDark ? "text-gray-100" : "text-gray-800"}>{label}</Text>
  </TouchableOpacity>
);

export const RecentSearchChips: React.FC<RecentSearchChipsProps> = ({
  onSelect,
  isDark,
}) => {
  const { data, isLoading, isError } = useRecentSearches(8);

  const chips = useMemo(() => {
    if (isError || !data || !data.searches?.length) {
      return fallbackSuggestions.map((item) => ({
        label: `${item.from} → ${item.to}`,
        from: item.from,
        to: item.to,
      }));
    }

    return data.searches.map((item: any) => ({
      label: `${item.fromAddress} to ${item.toAddress}`,
      from: item.fromAddress,
      to: item.toAddress,
    }));
  }, [data, isError]);

  return (
    <View className="px-4 mt-3 mb-3">

      {isLoading ? (
        <View className="flex-row">
          {[1, 2, 3].map((key) => (
            <View
              key={key}
              className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                isDark ? "bg-gray-800" : "bg-gray-200"
              }`}
              style={{ width: 110, height: 32 }}
            />
          ))}
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 8 }}
        >
          {chips.map((chip, idx) => (
            <Chip
              key={`${chip.label}-${idx}`}
              label={chip.label}
              isDark={isDark}
              onPress={() => onSelect(chip.from, chip.to)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};
