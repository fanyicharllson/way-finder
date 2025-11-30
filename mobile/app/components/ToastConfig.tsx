import React from "react";
import { BaseToast, ErrorToast, InfoToast } from "react-native-toast-message";
import { View, Text } from "react-native";

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#10B981",
        backgroundColor: "#ECFDF5",
        borderLeftWidth: 5,
        height: 70,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: "700",
        color: "#065F46",
      }}
      text2Style={{
        fontSize: 14,
        color: "#047857",
      }}
      text2NumberOfLines={2}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#EF4444",
        backgroundColor: "#FEF2F2",
        borderLeftWidth: 5,
        height: 70,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "700",
        color: "#991B1B",
      }}
      text2Style={{
        fontSize: 14,
        color: "#DC2626",
      }}
      text2NumberOfLines={2}
    />
  ),

  info: (props: any) => (
    <InfoToast
      {...props}
      style={{
        borderLeftColor: "#3B82F6",
        backgroundColor: "#EFF6FF",
        borderLeftWidth: 5,
        height: 70,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "700",
        color: "#1E40AF",
      }}
      text2Style={{
        fontSize: 14,
        color: "#2563EB",
      }}
      text2NumberOfLines={2}
    />
  ),

  warning: (props: any) => (
    <View className="bg-amber-50 border-l-4 border-amber-500 h-16 px-4 flex-row items-center rounded-r-xl shadow-lg">
      <View className="flex-1">
        <Text className="text-amber-900 font-bold text-base">
          {props.text1}
        </Text>
        {props.text2 && (
          <Text className="text-amber-700 text-sm mt-1">{props.text2}</Text>
        )}
      </View>
    </View>
  ),
};
