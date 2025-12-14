import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { showToast } from "@/utils/toast";

interface AddFavoriteModalProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  onSubmit?: (favoriteData: any) => void;
}

const QUICK_LABELS = [
  { id: "home", label: "Home", icon: "home" as const },
  { id: "work", label: "Work", icon: "briefcase" as const },
  { id: "gym", label: "Gym", icon: "barbell" as const },
  { id: "school", label: "School", icon: "school" as const },
  { id: "shopping", label: "Shopping", icon: "cart" as const },
  { id: "restaurant", label: "Restaurant", icon: "restaurant" as const },
];

export const AddFavoriteModal: React.FC<AddFavoriteModalProps> = ({
  visible,
  onClose,
  isDark,
  onSubmit,
}) => {
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [favoriteName, setFavoriteName] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = () => {
    if (!searchFrom.trim() || !searchTo.trim()) {
      showToast({
        type: "error",
        text1: "Missing Information",
        text2: "Please enter both origin and destination",
      });
      return;
    }

    if (!favoriteName.trim() && !selectedLabel) {
      showToast({
        type: "error",
        text1: "Missing Name",
        text2: "Please provide a name for this favorite",
      });
      return;
    }

    const favoriteData = {
      name: favoriteName.trim() || selectedLabel || "",
      from: searchFrom.trim(),
      to: searchTo.trim(),
      label: selectedLabel,
      notes: notes.trim() || undefined,
    };

    if (onSubmit) {
      onSubmit(favoriteData);
    }

    // Reset form
    setSearchFrom("");
    setSearchTo("");
    setFavoriteName("");
    setSelectedLabel(null);
    setNotes("");

    showToast({
      type: "success",
      text1: "Favorite Added",
      text2: "Route saved to your favorites",
    });

    onClose();
  };

  const handleLabelSelect = (labelId: string, labelText: string) => {
    setSelectedLabel(labelId);
    if (!favoriteName) {
      setFavoriteName(labelText);
    }
  };

  const handleSearchRoute = () => {
    if (!searchFrom.trim() || !searchTo.trim()) {
      showToast({
        type: "error",
        text1: "Missing Information",
        text2: "Please enter both locations to search",
      });
      return;
    }

    setIsSearching(true);
    // Simulate route search
    setTimeout(() => {
      setIsSearching(false);
      showToast({
        type: "info",
        text1: "Route Preview",
        text2: "Route verified successfully",
      });
    }, 1000);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        <View
          className={`rounded-t-3xl ${
            isDark ? "bg-gray-800" : "bg-white"
          } max-h-[90%]`}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <Text
              className={`text-xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Add Favorite Route
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons
                name="close"
                size={24}
                color={isDark ? "#9CA3AF" : "#6B7280"}
              />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
            {/* Quick Labels */}
            <View className="mb-6">
              <Text
                className={`text-sm font-semibold mb-3 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Quick Labels
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {QUICK_LABELS.map((label) => (
                  <TouchableOpacity
                    key={label.id}
                    onPress={() => handleLabelSelect(label.id, label.label)}
                    className={`flex-row items-center px-4 py-2.5 rounded-xl border ${
                      selectedLabel === label.id
                        ? isDark
                          ? "bg-blue-600 border-blue-600"
                          : "bg-blue-600 border-blue-600"
                        : isDark
                        ? "bg-gray-900 border-gray-700"
                        : "bg-gray-50 border-gray-300"
                    }`}
                  >
                    <Ionicons
                      name={label.icon}
                      size={18}
                      color={
                        selectedLabel === label.id
                          ? "#FFFFFF"
                          : isDark
                          ? "#9CA3AF"
                          : "#6B7280"
                      }
                    />
                    <Text
                      className={`ml-2 font-medium ${
                        selectedLabel === label.id
                          ? "text-white"
                          : isDark
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      {label.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Favorite Name */}
            <View className="mb-4">
              <Text
                className={`text-sm font-semibold mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Favorite Name
              </Text>
              <View
                className={`flex-row items-center border rounded-xl px-4 py-3 ${
                  isDark
                    ? "border-gray-700 bg-gray-900"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <Ionicons
                  name="heart"
                  size={20}
                  color={isDark ? "#EC4899" : "#DB2777"}
                />
                <TextInput
                  value={favoriteName}
                  onChangeText={setFavoriteName}
                  placeholder="e.g., Morning Commute"
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                  className={`flex-1 ml-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                />
              </View>
            </View>

            {/* From Input */}
            <View className="mb-4">
              <Text
                className={`text-sm font-semibold mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                From
              </Text>
              <View
                className={`flex-row items-center border rounded-xl px-4 py-3 ${
                  isDark
                    ? "border-gray-700 bg-gray-900"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <Ionicons
                  name="location"
                  size={20}
                  color={isDark ? "#10B981" : "#059669"}
                />
                <TextInput
                  value={searchFrom}
                  onChangeText={setSearchFrom}
                  placeholder="Enter starting location"
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                  className={`flex-1 ml-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                />
              </View>
            </View>

            {/* To Input */}
            <View className="mb-4">
              <Text
                className={`text-sm font-semibold mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                To
              </Text>
              <View
                className={`flex-row items-center border rounded-xl px-4 py-3 ${
                  isDark
                    ? "border-gray-700 bg-gray-900"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <Ionicons
                  name="location"
                  size={20}
                  color={isDark ? "#EF4444" : "#DC2626"}
                />
                <TextInput
                  value={searchTo}
                  onChangeText={setSearchTo}
                  placeholder="Enter destination"
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                  className={`flex-1 ml-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                />
              </View>
            </View>

            {/* Search Route Button */}
            <TouchableOpacity
              onPress={handleSearchRoute}
              disabled={isSearching}
              className={`flex-row items-center justify-center border-2 border-dashed rounded-xl py-3 mb-4 ${
                isDark
                  ? "border-gray-700 bg-gray-900/50"
                  : "border-gray-300 bg-gray-50"
              }`}
            >
              {isSearching ? (
                <ActivityIndicator
                  size="small"
                  color={isDark ? "#60A5FA" : "#2563EB"}
                />
              ) : (
                <>
                  <Ionicons
                    name="search"
                    size={18}
                    color={isDark ? "#60A5FA" : "#2563EB"}
                  />
                  <Text
                    className={`ml-2 font-medium ${
                      isDark ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    Preview Route
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Notes (Optional) */}
            <View className="mb-6">
              <Text
                className={`text-sm font-semibold mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Notes - Optional
              </Text>
              <View
                className={`border rounded-xl px-4 py-3 ${
                  isDark
                    ? "border-gray-700 bg-gray-900"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add notes about this favorite route"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                  className={`${isDark ? "text-white" : "text-gray-900"}`}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl py-4 items-center mb-4"
              style={{
                backgroundColor: "#EC4899",
              }}
            >
              <View className="flex-row items-center">
                <Ionicons name="heart" size={20} color="#FFFFFF" />
                <Text className="text-white font-semibold text-base ml-2">
                  Save Favorite
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
