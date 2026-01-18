import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchStep {
  id: string;
  label: string;
  estimatedDuration: number; // in ms
  status: "pending" | "loading" | "complete" | "slow";
}

interface RouteSearchProgressProps {
  isDark?: boolean;
  transportModesCount?: number;
}

export const RouteSearchProgress: React.FC<RouteSearchProgressProps> = ({
  isDark,
  transportModesCount = 3,
}) => {
  const [steps, setSteps] = useState<SearchStep[]>([
    {
      id: "location",
      label: "Verifying locations",
      estimatedDuration: 800,
      status: "loading",
    },
    {
      id: "traffic",
      label: "Checking live traffic",
      estimatedDuration: 1200,
      status: "pending",
    },
    {
      id: "pricing",
      label: "Comparing costs & availability",
      estimatedDuration: 1500,
      status: "pending",
    },
    {
      id: "routes",
      label: "Calculating optimal routes",
      estimatedDuration: 2000,
      status: "pending",
    },
    {
      id: "preferences",
      label: "Matching your preferences",
      estimatedDuration: 800,
      status: "pending",
    },
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showSlowWarning, setShowSlowWarning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Track elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 100);
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // Show slow warning after 8 seconds
  useEffect(() => {
    if (elapsedTime > 8000) {
      setShowSlowWarning(true);
    }
  }, [elapsedTime]);

  // Simulate step progression
  useEffect(() => {
    if (currentStepIndex >= steps.length) return;

    const currentStep = steps[currentStepIndex];
    const duration = currentStep.estimatedDuration;

    // Mark current step as loading
    setSteps((prev) =>
      prev.map((step, idx) =>
        idx === currentStepIndex ? { ...step, status: "loading" } : step
      )
    );

    // Complete current step after duration
    const timer = setTimeout(() => {
      setSteps((prev) =>
        prev.map((step, idx) =>
          idx === currentStepIndex ? { ...step, status: "complete" } : step
        )
      );
      setCurrentStepIndex((prev) => prev + 1);
    }, duration);

    // Mark as slow if taking too long
    const slowTimer = setTimeout(() => {
      setSteps((prev) =>
        prev.map((step, idx) =>
          idx === currentStepIndex && step.status === "loading"
            ? { ...step, status: "slow" }
            : step
        )
      );
    }, duration * 1.5);

    return () => {
      clearTimeout(timer);
      clearTimeout(slowTimer);
    };
  }, [currentStepIndex, steps.length]);

  const getStepIcon = (status: SearchStep["status"]) => {
    switch (status) {
      case "complete":
        return (
          <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        );
      case "loading":
      case "slow":
        return <ActivityIndicator size="small" color="#3B82F6" />;
      case "pending":
        return (
          <View className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded-full items-center justify-center">
            <View className="w-2 h-2 bg-gray-500 dark:bg-gray-500 rounded-full" />
          </View>
        );
    }
  };

  const getStepBgColor = (status: SearchStep["status"]) => {
    switch (status) {
      case "complete":
        return "bg-green-50 dark:bg-green-900/20";
      case "loading":
        return "bg-blue-50 dark:bg-blue-900/20";
      case "slow":
        return "bg-orange-50 dark:bg-orange-900/20";
      case "pending":
        return "bg-gray-50 dark:bg-gray-800/50";
    }
  };

  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full items-center justify-center mb-6">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>

      <Text className="text-gray-900 dark:text-white text-2xl font-bold text-center">
        Finding Best Routes
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 text-center mt-2">
        Analyzing {transportModesCount} transport option
        {transportModesCount !== 1 ? "s" : ""}
      </Text>

      {showSlowWarning && (
        <View className="mt-4 bg-orange-50 dark:bg-orange-900/20 px-4 py-3 rounded-xl border border-orange-200 dark:border-orange-800 max-w-xs">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={18} color="#F97316" />
            <Text className="text-orange-700 dark:text-orange-400 text-sm font-medium ml-2 flex-1">
              Taking longer than expected...
            </Text>
          </View>
          <Text className="text-orange-600 dark:text-orange-500 text-xs mt-1">
            High traffic or network latency detected
          </Text>
        </View>
      )}

      <View className="mt-8 gap-3 w-full max-w-xs">
        {steps.map((step, index) => (
          <View
            key={step.id}
            className={`flex-row items-center p-3 rounded-xl ${getStepBgColor(
              step.status
            )}`}
          >
            {getStepIcon(step.status)}
            <Text className="text-gray-700 dark:text-gray-300 ml-3 font-medium flex-1">
              {step.label}
            </Text>
            {step.status === "slow" && (
              <Ionicons name="hourglass-outline" size={16} color="#F97316" />
            )}
          </View>
        ))}
      </View>

      {/* Progress indicator */}
      <View className="mt-6 w-full max-w-xs">
        <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <View
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{
              width: `${Math.round(
                (currentStepIndex / steps.length) * 100
              )}%` as any,
            }}
          />
        </View>
        <Text className="text-gray-500 dark:text-gray-400 text-xs text-center mt-2">
          {currentStepIndex} of {steps.length} steps completed
        </Text>
      </View>

      {/* Elapsed time */}
      <Text className="text-gray-400 dark:text-gray-600 text-xs mt-4">
        {(elapsedTime / 1000).toFixed(1)}s elapsed
      </Text>
    </View>
  );
};
