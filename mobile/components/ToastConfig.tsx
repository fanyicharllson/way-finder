import React from "react";
import { View, Text, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const toastConfig = {
  success: (props: any) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    
    return (
      <View
        style={{
          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
          borderLeftColor: "#10B981",
          borderLeftWidth: 4,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          minHeight: 80,
          maxWidth: "90%",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.5 : 0.15,
          shadowRadius: 12,
          elevation: 8,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: isDark ? "#10B981" : "#D1FAE5",
            borderRadius: 12,
            width: 44,
            height: 44,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Ionicons
            name="checkmark-circle"
            size={28}
            color={isDark ? "#FFFFFF" : "#059669"}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: isDark ? "#FFFFFF" : "#111827",
              marginBottom: 2,
            }}
            numberOfLines={1}
          >
            {props.text1}
          </Text>
          {props.text2 && (
            <Text
              style={{
                fontSize: 13,
                color: isDark ? "#D1D5DB" : "#6B7280",
                marginTop: 2,
              }}
              numberOfLines={2}
            >
              {props.text2}
            </Text>
          )}
        </View>
      </View>
    );
  },

  error: (props: any) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    
    return (
      <View
        style={{
          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
          borderLeftColor: isDark ? "#F87171" : "#EF4444",
          borderLeftWidth: 4,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          minHeight: 80,
          maxWidth: "90%",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.5 : 0.15,
          shadowRadius: 12,
          elevation: 8,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: isDark ? "#DC2626" : "#FEE2E2",
            borderRadius: 12,
            width: 44,
            height: 44,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Ionicons
            name="close-circle"
            size={28}
            color={isDark ? "#FFFFFF" : "#DC2626"}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: isDark ? "#FFFFFF" : "#111827",
              marginBottom: 2,
            }}
            numberOfLines={1}
          >
            {props.text1}
          </Text>
          {props.text2 && (
            <Text
              style={{
                fontSize: 13,
                color: isDark ? "#D1D5DB" : "#6B7280",
                marginTop: 2,
              }}
              numberOfLines={2}
            >
              {props.text2}
            </Text>
          )}
        </View>
      </View>
    );
  },

  info: (props: any) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    
    return (
      <View
        style={{
          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
          borderLeftColor: "#3B82F6",
          borderLeftWidth: 4,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          minHeight: 80,
          maxWidth: "90%",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.5 : 0.15,
          shadowRadius: 12,
          elevation: 8,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: isDark ? "#3B82F6" : "#DBEAFE",
            borderRadius: 12,
            width: 44,
            height: 44,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Ionicons
            name="information-circle"
            size={28}
            color={isDark ? "#FFFFFF" : "#2563EB"}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: isDark ? "#FFFFFF" : "#111827",
              marginBottom: 2,
            }}
            numberOfLines={1}
          >
            {props.text1}
          </Text>
          {props.text2 && (
            <Text
              style={{
                fontSize: 13,
                color: isDark ? "#D1D5DB" : "#6B7280",
                marginTop: 2,
              }}
              numberOfLines={2}
            >
              {props.text2}
            </Text>
          )}
        </View>
      </View>
    );
  },

  warning: (props: any) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    
    return (
      <View
        style={{
          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
          borderLeftColor: isDark ? "#FBBF24" : "#F59E0B",
          borderLeftWidth: 4,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          minHeight: 80,
          maxWidth: "90%",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.5 : 0.15,
          shadowRadius: 12,
          elevation: 8,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: isDark ? "#F59E0B" : "#FEF3C7",
            borderRadius: 12,
            width: 44,
            height: 44,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Ionicons
            name="warning"
            size={28}
            color={isDark ? "#FFFFFF" : "#D97706"}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: isDark ? "#FFFFFF" : "#111827",
              marginBottom: 2,
            }}
            numberOfLines={1}
          >
            {props.text1}
          </Text>
          {props.text2 && (
            <Text
              style={{
                fontSize: 13,
                color: isDark ? "#D1D5DB" : "#6B7280",
                marginTop: 2,
              }}
              numberOfLines={2}
            >
              {props.text2}
            </Text>
          )}
        </View>
      </View>
    );
  },
};

// Provide a default no-op component so Expo Router doesn't warn about a missing default export
export default function ToastConfigNoop(): React.ReactElement | null {
  return null;
}
