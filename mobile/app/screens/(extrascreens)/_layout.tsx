import { Stack } from "expo-router";

export default function ExtraScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, headerBackVisible: false }}>
      <Stack.Screen name="preferences" />
      <Stack.Screen name="success.screen" />
      <Stack.Screen name="error.screen" />
    </Stack>
  );
}
