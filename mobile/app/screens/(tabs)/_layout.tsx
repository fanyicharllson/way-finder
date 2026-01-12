import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { View, Platform } from "react-native";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3B82F6", // Blue
        tabBarInactiveTintColor: isDark ? "#6B7280" : "#9CA3AF",
        tabBarStyle: {
          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
          borderTopWidth: 0, // Remove default border for floating effect
          height: Platform.OS === "ios" ? 70 : 65,
          paddingBottom: Platform.OS === "ios" ? 8 : 10,
          paddingTop: 8,
          paddingHorizontal: 0,
          position: "absolute", // Make it floating
          bottom: insets.bottom + 16, // Float above bottom
          marginHorizontal: 10,
          left: 16,
          right: 16,
          borderRadius: 50, // Rounded edges
          elevation: 12,
          zIndex: 1000, // Controlled z-index below floating buttons
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.5 : 0.15,
          shadowRadius: 16,
          // Add subtle border for definition
          borderWidth: isDark ? 1 : 0.5,
          borderColor: isDark ? "#374151" : "#E5E7EB",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`items-center justify-center ${
                focused ? "w-12 h-12 rounded-2xl bg-blue-500/10" : ""
              }`}
            >
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`items-center justify-center ${
                focused ? "w-12 h-12 rounded-2xl bg-blue-500/10" : ""
              }`}
            >
              <Ionicons
                name={focused ? "map" : "map-outline"}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="favorite"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`items-center justify-center ${
                focused ? "w-12 h-12 rounded-2xl bg-blue-500/10" : ""
              }`}
            >
              <Ionicons
                name={focused ? "heart" : "heart-outline"}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`items-center justify-center ${
                focused ? "w-12 h-12 rounded-2xl bg-blue-500/10" : ""
              }`}
            >
              <Ionicons
                name={focused ? "time" : "time-outline"}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`items-center justify-center ${
                focused ? "w-12 h-12 rounded-2xl bg-blue-500/10" : ""
              }`}
            >
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
