import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ColorValue,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";

const SuccessErrorScreen: React.FC<ResultScreenProps> = ({
  type,
  title,
  message,
  animationSource,
  autoRedirectSeconds = 3,
  onContinue,
  onRetry,
  showTimer = true,
}) => {
  const [countdown, setCountdown] = useState(autoRedirectSeconds);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const isSuccess = type === "success";
  const colors = isSuccess
    ? isDark
      ? ["#0A0F1A", "#1a2332"]
      : ["#F0FDF4", "#DCFCE7"]
    : isDark
    ? ["#0A0F1A", "#1a2332"]
    : ["#FEF2F2", "#FEE2E2"];

  const accentColor = isSuccess ? "#10B981" : "#EF4444";

  useEffect(() => {
    if (!showTimer) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [showTimer, onContinue]);

  // Separate effect: perform navigation/callback after countdown reaches 0
  useEffect(() => {
    if (!showTimer) return;
    if (countdown === 0) {
      // call onContinue in an effect (not during render or inside state updater)
      onContinue();
    }
  }, [countdown, showTimer, onContinue]);

  return (
    <LinearGradient
      colors={colors as [ColorValue, ColorValue, ...ColorValue[]]}
      style={{ flex: 1 }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors[0]}
      />

      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center px-8">
          {/* Lottie Animation */}
          <LottieView
            source={animationSource}
            autoPlay
            loop={false}
            style={{ width: 200, height: 200 }}
          />

          {/* Title */}
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mt-8 text-center">
            {title}
          </Text>

          {/* Message */}
          <Text className="text-base text-gray-600 dark:text-gray-400 mt-4 text-center leading-6">
            {message}
          </Text>

          {/* Timer */}
          {showTimer && countdown > 0 && (
            <View className="mt-8 items-center">
              <View
                className="w-16 h-16 rounded-full items-center justify-center border-4"
                style={{ borderColor: accentColor }}
              >
                <Text
                  className="text-2xl font-bold"
                  style={{ color: accentColor }}
                >
                  {countdown}
                </Text>
              </View>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2 animate-pulse">
                Redirecting...
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="w-full mt-12 gap-3">
            {/* Primary Button (Continue/Go to Dashboard) */}
            <TouchableOpacity
              onPress={onContinue}
              activeOpacity={0.8}
              className="w-full h-16 rounded-2xl items-center justify-center flex-row"
              style={{
                backgroundColor: accentColor,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Text className="text-white text-lg font-bold mr-2">
                {isSuccess ? "Go to Dashboard" : "Try Again"}
              </Text>
              <Ionicons
                name={isSuccess ? "arrow-forward" : "refresh"}
                size={20}
                color="white"
              />
            </TouchableOpacity>

            {/* Retry Button (Only for errors if provided) */}
            {!isSuccess && onRetry && (
              <TouchableOpacity
                onPress={onRetry}
                activeOpacity={0.7}
                className="w-full h-14 rounded-2xl items-center justify-center border-2 border-gray-300 dark:border-gray-700"
              >
                <Text className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  Go Back
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SuccessErrorScreen;
