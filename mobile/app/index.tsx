import { ActivityIndicator, View } from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";

const Index = () => {
  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    // Navigate to onboarding or main app based on first launch for now
    // In a real app, this would check if the app has been launched before

    router.replace("/screens/onboarding.screen");
  };

  return (
    <View className="flex-1 bg-indigo-600 items-center justify-center">
      <ActivityIndicator size="large" color="white" />
    </View>
  );
};

export default Index;
