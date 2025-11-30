import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function ForgetPassword() {

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-xl font-bold mb-4">Forgot Password</Text>
      <Text className="text-center text-gray-600 mb-6">
        If you forgot your password, enter your email on the login screen and
        tap &quot;Forgot Password&quot; to receive reset instructions.
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/screens/(auth)/login")}
        className="px-6 py-3 bg-blue-600 rounded-full"
      >
        <Text className="text-white font-semibold">Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}
