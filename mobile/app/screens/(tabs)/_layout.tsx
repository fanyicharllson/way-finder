import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
// import { useTheme } from "@/components/ThemeProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  // const { actualTheme } = useTheme();
  const insets = useSafeAreaInsets();
  // const isDark = actualTheme === "dark";
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3b82f6", // Blue primary color
        tabBarInactiveTintColor:  "#e5e7eb", // Slate for inactive
        tabBarStyle: {
          backgroundColor:  "#111827", // slate-800 : white
          borderTopColor:  "#374151", // slate-700 : slate-200
          borderTopWidth: 1,
          // Perfect spacing for all devices
          height: 60 + (insets.bottom || 30), // Auto-adjusts for home indicator
          paddingBottom: Math.max(insets.bottom, 20), // Minimum 20px padding
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "600",
          marginBottom: 5,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorite"
        options={{
          title: "Favorite",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profle",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
