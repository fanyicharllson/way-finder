import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
// import DateTimePicker from "@react-native-community/datetimepicker";
import { showToast } from "@/utils/toast";

interface AddTripModalProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  onSubmit?: (tripData: any) => void;
}

const TRANSPORT_MODES = [
  { id: "WALKING", label: "Walking", icon: "walk" as const },
  { id: "BUS", label: "Bus", icon: "bus" as const },
  { id: "TRAIN", label: "Train", icon: "train" as const },
  { id: "CAR", label: "Car", icon: "car" as const },
  { id: "BIKE", label: "Bike", icon: "bicycle" as const },
  { id: "FERRY", label: "Ferry", icon: "boat" as const },
];

export const AddTripModal: React.FC<AddTripModalProps> = ({
  visible,
  onClose,
  isDark,
  onSubmit,
}) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [mode, setMode] = useState<string>("BUS");
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [distance, setDistance] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleSubmit = () => {
    if (!from.trim() || !to.trim()) {
      showToast({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill in origin and destination",
      });
      return;
    }

    const tripData = {
      from: from.trim(),
      to: to.trim(),
      mode,
      date: date.toISOString(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      distance: distance ? parseFloat(distance) : undefined,
      cost: cost ? parseFloat(cost) : undefined,
      notes: notes.trim() || undefined,
    };

    if (onSubmit) {
      onSubmit(tripData);
    }

    // Reset form
    setFrom("");
    setTo("");
    setMode("BUS");
    setDate(new Date());
    setStartTime(new Date());
    setEndTime(new Date());
    setDistance("");
    setCost("");
    setNotes("");

    showToast({
      type: "success",
      text1: "Trip Added",
      text2: "Your manual trip has been logged",
    });

    onClose();
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
              Add Manual Trip
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
                  color={isDark ? "#60A5FA" : "#2563EB"}
                />
                <TextInput
                  value={from}
                  onChangeText={setFrom}
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
                  value={to}
                  onChangeText={setTo}
                  placeholder="Enter destination"
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                  className={`flex-1 ml-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                />
              </View>
            </View>

            {/* Transport Mode */}
            <View className="mb-4">
              <Text
                className={`text-sm font-semibold mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Transport Mode
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {TRANSPORT_MODES.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setMode(m.id)}
                    className={`flex-row items-center px-4 py-2.5 rounded-xl border ${
                      mode === m.id
                        ? isDark
                          ? "bg-blue-600 border-blue-600"
                          : "bg-blue-600 border-blue-600"
                        : isDark
                        ? "bg-gray-900 border-gray-700"
                        : "bg-gray-50 border-gray-300"
                    }`}
                  >
                    <Ionicons
                      name={m.icon}
                      size={18}
                      color={
                        mode === m.id
                          ? "#FFFFFF"
                          : isDark
                          ? "#9CA3AF"
                          : "#6B7280"
                      }
                    />
                    <Text
                      className={`ml-2 font-medium ${
                        mode === m.id
                          ? "text-white"
                          : isDark
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date */}
            <View className="mb-4">
              <Text
                className={`text-sm font-semibold mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className={`flex-row items-center border rounded-xl px-4 py-3 ${
                  isDark
                    ? "border-gray-700 bg-gray-900"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <Ionicons
                  name="calendar"
                  size={20}
                  color={isDark ? "#60A5FA" : "#2563EB"}
                />
                <Text
                  className={`ml-3 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {formatDate(date)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Start Time */}
            <View className="mb-4">
              <Text
                className={`text-sm font-semibold mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Start Time
              </Text>
              <TouchableOpacity
                onPress={() => setShowStartTimePicker(true)}
                className={`flex-row items-center border rounded-xl px-4 py-3 ${
                  isDark
                    ? "border-gray-700 bg-gray-900"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <Ionicons
                  name="time"
                  size={20}
                  color={isDark ? "#60A5FA" : "#2563EB"}
                />
                <Text
                  className={`ml-3 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {formatTime(startTime)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* End Time */}
            <View className="mb-4">
              <Text
                className={`text-sm font-semibold mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                End Time
              </Text>
              <TouchableOpacity
                onPress={() => setShowEndTimePicker(true)}
                className={`flex-row items-center border rounded-xl px-4 py-3 ${
                  isDark
                    ? "border-gray-700 bg-gray-900"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <Ionicons
                  name="time"
                  size={20}
                  color={isDark ? "#60A5FA" : "#2563EB"}
                />
                <Text
                  className={`ml-3 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {formatTime(endTime)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Distance (Optional) */}
            <View className="mb-4">
              <Text
                className={`text-sm font-semibold mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Distance (km) - Optional
              </Text>
              <View
                className={`flex-row items-center border rounded-xl px-4 py-3 ${
                  isDark
                    ? "border-gray-700 bg-gray-900"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <Ionicons
                  name="speedometer"
                  size={20}
                  color={isDark ? "#60A5FA" : "#2563EB"}
                />
                <TextInput
                  value={distance}
                  onChangeText={setDistance}
                  placeholder="e.g., 5.2"
                  keyboardType="decimal-pad"
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                  className={`flex-1 ml-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                />
              </View>
            </View>

            {/* Cost (Optional) */}
            <View className="mb-4">
              <Text
                className={`text-sm font-semibold mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Cost ($) - Optional
              </Text>
              <View
                className={`flex-row items-center border rounded-xl px-4 py-3 ${
                  isDark
                    ? "border-gray-700 bg-gray-900"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <Ionicons
                  name="cash"
                  size={20}
                  color={isDark ? "#60A5FA" : "#2563EB"}
                />
                <TextInput
                  value={cost}
                  onChangeText={setCost}
                  placeholder="e.g., 2.50"
                  keyboardType="decimal-pad"
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                  className={`flex-1 ml-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                />
              </View>
            </View>

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
                  placeholder="Add any notes about this trip"
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
              className="bg-blue-600 rounded-xl py-4 items-center mb-4"
            >
              <Text className="text-white font-semibold text-base">
                Add Trip
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Date Picker - Commented out until dependency installed */}
          {/* {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event: any, selectedDate?: Date) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )} */}

          {/* Start Time Picker - Commented out until dependency installed */}
          {/* {showStartTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event: any, selectedTime?: Date) => {
                setShowStartTimePicker(Platform.OS === "ios");
                if (selectedTime) {
                  setStartTime(selectedTime);
                }
              }}
            />
          )} */}

          {/* End Time Picker - Commented out until dependency installed */}
          {/* {showEndTimePicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event: any, selectedTime?: Date) => {
                setShowEndTimePicker(Platform.OS === "ios");
                if (selectedTime) {
                  setEndTime(selectedTime);
                }
              }}
            />
          )} */}
        </View>
      </View>
    </Modal>
  );
};
