import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "./globals.css";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ToastConfig";
import { NotificationService } from "@/utils/notification";

const queryClient = new QueryClient();
// const prefix = createURL("/");

// Inner App component that uses useTheme (must be inside ThemeProvider)
function App() {
  //   const { actualTheme } = useTheme(); // Now safe to call here

  useEffect(() => {
    // Initialize notifications
    NotificationService.initialize();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="screens/onboarding.screen" />
        <Stack.Screen name="screens/(auth)" />
        <Stack.Screen name="screens/(tabs)" />
        <Stack.Screen name="screens/(extrascreens)" />
      </Stack>
      
      {/* Global Toast Component */}
      <Toast config={toastConfig} />

      {/* Update modal in case any updates */}
      {/* <AppUpdateModal
            visible={updateAvailable}
            isDownloading={isDownloading}
            onReload={reloadApp}
          /> */}

      {/* Network overlay */}
      {/* <NetworkOverlay /> */}
    </>
  );
}

// Small overlay component that consumes network context to render global modal
// function NetworkOverlay() {
//   const { isConnected, error, triggerRefetch, isSyncing } = useNetwork();

//   return (
//     <NetworkErrorModal
//       visible={isConnected === false}
//       error={error}
//       onRetry={async () => {
//         await triggerRefetch();
//       }}
//     />
//   );
// }

// Small global sync indicator shown on top-right when any global sync is running
// function SyncIndicator() {
//   const { isSyncing } = useNetwork();
//   const insets = useSafeAreaInsets();
//   const translateY = useRef(new Animated.Value(-24)).current;
//   const opacity = useRef(new Animated.Value(0)).current;
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     let alive = true;
//     if (isSyncing) {
//       setMounted(true);
//       Animated.parallel([
//         Animated.timing(translateY, {
//           toValue: 0,
//           duration: 260,
//           useNativeDriver: true,
//         }),
//         Animated.timing(opacity, {
//           toValue: 1,
//           duration: 260,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     } else {
//       Animated.parallel([
//         Animated.timing(translateY, {
//           toValue: -24,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//         Animated.timing(opacity, {
//           toValue: 0,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//       ]).start(() => {
//         if (alive) setMounted(false);
//       });
//     }

//     return () => {
//       alive = false;
//     };
//   }, [isSyncing, translateY, opacity]);

//   if (!mounted) return null;

//   return (
//     <Animated.View
//       pointerEvents="box-none"
//       style={{
//         position: "absolute",
//         top: insets.top + 8,
//         left: 0,
//         right: 0,
//         alignItems: "center",
//         transform: [{ translateY }],
//         opacity,
//         zIndex: 9999,
//         elevation: 999,
//       }}
//     >
//       <View className="flex-row items-center bg-gray-200 dark:bg-slate-600 rounded-full px-3 py-2 shadow-md">
//         <ActivityIndicator
//           size="small"
//           color="#ef4444"
//           style={{ marginRight: 8 }}
//         />
//         <Text className="text-slate-900 dark:text-slate-100 text-sm">
//           Syncing your data…
//         </Text>
//       </View>
//     </Animated.View>
//   );
// }

export default function RootLayout() {
  // Call useAppUpdate here (outside providers)
  //   const { updateAvailable, isDownloading, reloadApp } = useAppUpdate();

  return (
    <QueryClientProvider client={queryClient}>
      {/* <ThemeProvider> */}
      {/* Pass props to App so it can use them */}
      <App />
      {/* </ThemeProvider> */}
    </QueryClientProvider>
  );
}
