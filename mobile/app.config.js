export default {
  expo: {
    name: "WayFinder",
    slug: "WayFinder",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/wayfinder-splash-logo.png",
    scheme: "wayfinder",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.x200456.WayFinder",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#0A0F1A"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.POST_NOTIFICATIONS"
      ],
      package: "com.x200456.WayFinder"
    },
    web: {
      output: "static",
      favicon: "./assets/images/wayfinder-splash-logo.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/wayfinder-splash-logo.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#0A0F1A",
          dark: {
            backgroundColor: "#0A0F1A"
          }
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow WayFinder to use your location for route planning."
        }
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/wayfinder-splash-logo.png",
          color: "#3B82F6",
          sounds: []
        }
      ],
      [
        "@rnmapbox/maps",
        {
          RNMapboxMapsImpl: "mapbox"
        }
      ],
      "expo-secure-store",
      "@react-native-community/datetimepicker",
      "expo-font",
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      BACKEND_ENDPOINT: process.env.EXPO_PUBLIC_BACKEND_URL || "http://104.248.41.42:5000/api",
      router: {},
      eas: {
        projectId: "c417df1d-00bd-46b4-83e6-b59f9fc87c26"
      }
    }
  }
};