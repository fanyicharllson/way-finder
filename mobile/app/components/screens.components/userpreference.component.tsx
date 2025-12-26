import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { useSavePreferences, useUpdatePreferences } from "@/hooks/usePreferences";
import {
  PreferencesFormData,
  preferencesSchema,
} from "@/utils/userpreference.validation.utils";
import {
  DEFAULT_TRANSPORT_MODES,
  PRIORITY_TYPES,
} from "@/data/userpreferences.data";

const TransportModeSelector: React.FC<TransportModeSelectorProps> = ({
  selectedModes,
  onToggle,
  onAddCustom,
  isDark,
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMode, setCustomMode] = useState("");

  const handleAddCustom = () => {
    const trimmed = customMode.trim();
    if (trimmed && !selectedModes.includes(trimmed)) {
      onAddCustom(trimmed);
      setCustomMode("");
      setShowCustomInput(false);
    }
  };

  // Combine default modes with custom modes
  const allModes = [
    ...DEFAULT_TRANSPORT_MODES,
    ...selectedModes
      .filter((mode) => !DEFAULT_TRANSPORT_MODES.find((m) => m.id === mode))
      .map((mode) => ({ id: mode, label: mode, icon: "car-outline" })),
  ];

  return (
    <View>
      <View className="flex-row flex-wrap gap-3 mb-3">
        {allModes.map((mode) => {
          const isSelected = selectedModes.includes(mode.id);
          return (
            <TouchableOpacity
              key={mode.id}
              onPress={() => onToggle(mode.id)}
              activeOpacity={0.7}
              className={`flex-1 min-w-[42%] h-20 rounded-2xl items-center justify-center border-2 ${
                isSelected
                  ? "bg-blue-500 border-blue-500"
                  : isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <Ionicons
                name={mode.icon as any}
                size={28}
                color={isSelected ? "#FFFFFF" : isDark ? "#9CA3AF" : "#4B5563"}
              />
              <Text
                className={`mt-1 font-semibold text-sm ${
                  isSelected ? "text-white" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Add Custom Mode Button */}
      {!showCustomInput ? (
        <TouchableOpacity
          onPress={() => setShowCustomInput(true)}
          activeOpacity={0.7}
          className="flex-row items-center justify-center h-12 rounded-xl border-2 border-dashed border-gray-400 dark:border-gray-600"
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={isDark ? "#9CA3AF" : "#6B7280"}
          />
          <Text className="ml-2 text-gray-600 dark:text-gray-400 font-medium">
            Add Custom Mode
          </Text>
        </TouchableOpacity>
      ) : (
        <View className="flex-row gap-2">
          <TextInput
            className="flex-1 h-12 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-blue-500"
            placeholder="e.g., Rickshaw, Uber, Metro"
            placeholderTextColor="#9CA3AF"
            value={customMode}
            onChangeText={setCustomMode}
            autoFocus
          />
          <TouchableOpacity
            onPress={handleAddCustom}
            className="w-12 h-12 rounded-xl bg-blue-500 items-center justify-center"
          >
            <Ionicons name="checkmark" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setShowCustomInput(false);
              setCustomMode("");
            }}
            className="w-12 h-12 rounded-xl bg-gray-300 dark:bg-gray-700 items-center justify-center"
          >
            <Ionicons
              name="close"
              size={24}
              color={isDark ? "#9CA3AF" : "#4B5563"}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// --- PRIORITY SELECTOR ---
const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  selectedPriority,
  onSelect,
  isDark,
}) => {
  return (
    <View className="gap-3">
      {PRIORITY_TYPES.map((priority) => {
        const isSelected = selectedPriority === priority.id;
        return (
          <TouchableOpacity
            key={priority.id}
            onPress={() => onSelect(priority.id as any)}
            activeOpacity={0.7}
            className={`flex-row items-center p-4 rounded-2xl border-2 ${
              isSelected
                ? "bg-blue-500 border-blue-500"
                : isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <View
              className={`w-12 h-12 rounded-full items-center justify-center ${
                isSelected ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              <Ionicons
                name={priority.icon as any}
                size={24}
                color={isSelected ? "#FFFFFF" : isDark ? "#9CA3AF" : "#4B5563"}
              />
            </View>
            <View className="flex-1 ml-4">
              <Text
                className={`text-lg font-bold ${
                  isSelected ? "text-white" : "text-gray-900 dark:text-white"
                }`}
              >
                {priority.label}
              </Text>
              <Text
                className={`text-sm ${
                  isSelected
                    ? "text-white/80"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {priority.description}
              </Text>
            </View>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// --- DYNAMIC ZONE MANAGER ---
const ZoneManager: React.FC<ZoneManagerProps> = ({
  zones,
  onAdd,
  onRemove,
  isDark,
}) => {
  const [showInput, setShowInput] = useState(false);
  const [newZone, setNewZone] = useState("");

  const handleAdd = () => {
    const trimmed = newZone.trim();
    if (trimmed && !zones.includes(trimmed)) {
      onAdd(trimmed);
      setNewZone("");
      setShowInput(false);
    }
  };

  return (
    <View>
      {zones.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mb-3">
          {zones.map((zone) => (
            <View
              key={zone}
              className="flex-row items-center px-3 py-2 rounded-full bg-red-500"
            >
              <Text className="text-white font-medium mr-2">{zone}</Text>
              <TouchableOpacity onPress={() => onRemove(zone)}>
                <Ionicons name="close-circle" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {!showInput ? (
        <TouchableOpacity
          onPress={() => setShowInput(true)}
          activeOpacity={0.7}
          className="flex-row items-center justify-center h-12 rounded-xl border-2 border-dashed border-gray-400 dark:border-gray-600"
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={isDark ? "#9CA3AF" : "#6B7280"}
          />
          <Text className="ml-2 text-gray-600 dark:text-gray-400 font-medium">
            Add Zone to Avoid
          </Text>
        </TouchableOpacity>
      ) : (
        <View className="flex-row gap-2">
          <TextInput
            className="flex-1 h-12 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-red-500"
            placeholder="e.g., Downtown, Highway 5, Main St"
            placeholderTextColor="#9CA3AF"
            value={newZone}
            onChangeText={setNewZone}
            autoFocus
          />
          <TouchableOpacity
            onPress={handleAdd}
            className="w-12 h-12 rounded-xl bg-red-500 items-center justify-center"
          >
            <Ionicons name="checkmark" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setShowInput(false);
              setNewZone("");
            }}
            className="w-12 h-12 rounded-xl bg-gray-300 dark:bg-gray-700 items-center justify-center"
          >
            <Ionicons
              name="close"
              size={24}
              color={isDark ? "#9CA3AF" : "#4B5563"}
            />
          </TouchableOpacity>
        </View>
      )}

      <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Add specific areas, roads, or neighborhoods you prefer to avoid
      </Text>
    </View>
  );
};

// --- MAIN PREFERENCES SCREEN ---
const PreferencesScreenComponent: React.FC<PreferencesScreenProps> = ({
  initialData,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  
  // Determine if user is editing existing preferences
  const isEditingMode = !!initialData;

  const savePreferencesMutation = useSavePreferences();
  const updatePreferencesMutation = useUpdatePreferences();
  // separate mutation for "Save for Later" so each action has its own loading state
  const saveLaterMutation = useSavePreferences();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema as any),
    defaultValues: {
      maxBudget: initialData?.maxBudget || 1000,
      preferredModes: initialData?.preferredModes || [],
      avoidanceZones: initialData?.avoidanceZones || [],
      priorityType: initialData?.priorityType || "balanced",
    },
  });

  const selectedModes = watch("preferredModes");
  const selectedZones = watch("avoidanceZones");
  // const selectedPriority = watch("priorityType");

  const toggleMode = (mode: string) => {
    const current = selectedModes || [];
    if (current.includes(mode)) {
      setValue(
        "preferredModes",
        current.filter((m) => m !== mode)
      );
    } else {
      setValue("preferredModes", [...current, mode]);
    }
  };

  const addCustomMode = (mode: string) => {
    const current = selectedModes || [];
    setValue("preferredModes", [...current, mode]);
  };

  const addZone = (zone: string) => {
    const current = selectedZones || [];
    setValue("avoidanceZones", [...current, zone]);
  };

  const removeZone = (zone: string) => {
    const current = selectedZones || [];
    setValue(
      "avoidanceZones",
      current.filter((z) => z !== zone)
    );
  };

  const onSubmit = (data: PreferencesFormData) => {
    const preferenceDTO: UserPreferenceDTO = {
      maxBudget: data.maxBudget,
      preferredModes: data.preferredModes,
      avoidanceZones: data.avoidanceZones,
      priorityType: data.priorityType,
      isComplete: true,
    };

    // Use update hook if editing, save hook if creating new
    if (isEditingMode) {
      updatePreferencesMutation.mutate(preferenceDTO);
         } else {
      savePreferencesMutation.mutate(preferenceDTO);
    }
  };

  const handleSaveLater = () => {
    const currentData = watch();
    const preferenceDTO: UserPreferenceDTO = {
      maxBudget: currentData.maxBudget || 1000,
      preferredModes: currentData.preferredModes || [],
      avoidanceZones: currentData.avoidanceZones || [],
      priorityType: currentData.priorityType || "balanced",
      isComplete: false,
    };

    // Use separate mutation instance so the Save Later button can show its own loading
    saveLaterMutation.mutate(preferenceDTO);
  };

  const isLoading = isEditingMode 
    ? updatePreferencesMutation.isPending 
    : savePreferencesMutation.isPending;
  const isSavingLater = saveLaterMutation.isPending;

  return (
    <LinearGradient
      colors={isDark ? ["#0A0F1A", "#1a2332"] : ["#F9FAFB", "#FFFFFF"]}
      style={{ flex: 1 }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0A0F1A" : "#F9FAFB"}
      />

      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 60 }}
        >
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Personalize Your Journey
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-400">
              Customize preferences for routes anywhere in the world
            </Text>
          </View>

          {/* Budget Section */}
          <View className="mb-8">
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="wallet-outline"
                size={24}
                color={isDark ? "#9CA3AF" : "#4B5563"}
              />
              <Text className="text-lg font-bold text-gray-900 dark:text-white ml-2">
                Maximum Budget (per trip)
              </Text>
            </View>
            <Controller
              control={control}
              name="maxBudget"
              render={({ field: { onChange, value } }) => (
                <View>
                  <View
                    className={`flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 border-2 ${
                      errors.maxBudget
                        ? "border-red-500"
                        : "border-transparent dark:border-gray-700"
                    }`}
                  >
                    <TextInput
                      className="flex-1 h-14 text-gray-900 dark:text-white text-lg font-semibold"
                      placeholder="1000"
                      placeholderTextColor="#9CA3AF"
                      value={value?.toString()}
                      onChangeText={(text) => {
                        const num = parseInt(text) || 0;
                        onChange(num);
                      }}
                      keyboardType="numeric"
                    />
                    <Text className="text-gray-500 dark:text-gray-400 font-medium">
                      Currency
                    </Text>
                  </View>
                  {errors.maxBudget && (
                    <Text className="text-red-500 text-sm mt-1 ml-1">
                      {errors.maxBudget.message}
                    </Text>
                  )}
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Enter your budget in your local currency
                  </Text>
                </View>
              )}
            />
          </View>

          {/* Transport Modes Section */}
          <View className="mb-8">
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="car-sport-outline"
                size={24}
                color={isDark ? "#9CA3AF" : "#4B5563"}
              />
              <Text className="text-lg font-bold text-gray-900 dark:text-white ml-2">
                Preferred Transport Modes
              </Text>
            </View>
            <TransportModeSelector
              selectedModes={selectedModes}
              onToggle={toggleMode}
              onAddCustom={addCustomMode}
              isDark={isDark}
            />
            {errors.preferredModes && (
              <Text className="text-red-500 text-sm mt-2 ml-1">
                {errors.preferredModes.message}
              </Text>
            )}
          </View>

          {/* Priority Section */}
          <View className="mb-8">
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="options-outline"
                size={24}
                color={isDark ? "#9CA3AF" : "#4B5563"}
              />
              <Text className="text-lg font-bold text-gray-900 dark:text-white ml-2">
                Route Priority
              </Text>
            </View>
            <Controller
              control={control}
              name="priorityType"
              render={({ field: { onChange, value } }) => (
                <PrioritySelector
                  selectedPriority={value}
                  onSelect={onChange}
                  isDark={isDark}
                />
              )}
            />
          </View>

          {/* Avoidance Zones Section */}
          <View className="mb-8">
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="alert-circle-outline"
                size={24}
                color={isDark ? "#9CA3AF" : "#4B5563"}
              />
              <Text className="text-lg font-bold text-gray-900 dark:text-white ml-2">
                Zones to Avoid (Optional)
              </Text>
            </View>
            <ZoneManager
              zones={selectedZones}
              onAdd={addZone}
              onRemove={removeZone}
              isDark={isDark}
            />
          </View>

          {/* Action Buttons */}
          <View className="gap-3 mt-4">
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              activeOpacity={0.8}
              className="w-full h-16 rounded-2xl items-center justify-center"
              style={{
                backgroundColor: isDark ? "#FFFFFF" : "#0A0F1A",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              {isLoading ? (
                <ActivityIndicator
                  color={isDark ? "#0A0F1A" : "#FFFFFF"}
                  size="small"
                />
              ) : (
                <Text
                  className="text-lg font-bold"
                  style={{ color: isDark ? "#0A0F1A" : "#FFFFFF" }}
                >
                  {isEditingMode ? "Update Preferences" : "Save & Continue"}
                </Text>
              )}
            </TouchableOpacity>

            {!isEditingMode && (
              <TouchableOpacity
                onPress={handleSaveLater}
                disabled={isSavingLater}
                activeOpacity={0.7}
                className="w-full h-14 rounded-2xl items-center justify-center border-2 border-gray-300 dark:border-gray-700"
              >
                {isSavingLater ? (
                  <ActivityIndicator size="small" color={isDark ? "#FFFFFF" : "#0A0F1A"} />
                ) : (
                  <Text className="text-base font-semibold text-gray-700 dark:text-gray-300">
                    Save for Later
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default PreferencesScreenComponent;
