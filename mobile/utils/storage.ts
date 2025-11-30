import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "wayfinder_auth_token";
const USER_KEY = "wayfinder_user_data";
const ONBOARDING_KEY = "@wayfinder_onboarding_completed";
const USER_PREFERENCES_KEY = "@wayfinder_user_preferences";

// --- ONBOARDING STATUS ---
export const markOnboardingComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    console.log("✅ Onboarding marked as complete");
  } catch (error) {
    console.error("❌ Error marking onboarding complete:", error);
  }
};

export const hasSeenOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === "true";
  } catch (error) {
    console.error("❌ Error checking onboarding status:", error);
    return false;
  }
};

export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    console.log("✅ Onboarding reset");
  } catch (error) {
    console.error("❌ Error resetting onboarding:", error);
  }
};

// --- USER PREFERENCES ---
export const saveUserPreferences = async (preferences: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      USER_PREFERENCES_KEY,
      JSON.stringify(preferences)
    );
    console.log("✅ User preferences saved");
  } catch (error) {
    console.error("❌ Error saving preferences:", error);
  }
};

export const getUserPreferences = async (): Promise<any | null> => {
  try {
    const preferences = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
    return preferences ? JSON.parse(preferences) : null;
  } catch (error) {
    console.error("❌ Error getting preferences:", error);
    return null;
  }
};

export const removeUserPreferences = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_PREFERENCES_KEY);
    console.log("✅ User preferences removed");
  } catch (error) {
    console.error("❌ Error removing preferences:", error);
  }
};

// --- TOKEN MANAGEMENT ---
export const saveToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    console.log("✅ Token saved securely");
  } catch (error) {
    console.error("❌ Error saving token:", error);
    throw error;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("❌ Error getting token:", error);
    return null;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    console.log("✅ Token removed");
  } catch (error) {
    console.error("❌ Error removing token:", error);
  }
};

// --- USER DATA MANAGEMENT (Optional: Cache user info) ---
export const saveUserData = async (userData: any): Promise<void> => {
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error("❌ Error saving user data:", error);
  }
};

export const getUserData = async (): Promise<any | null> => {
  try {
    const data = await SecureStore.getItemAsync(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("❌ Error getting user data:", error);
    return null;
  }
};

export const removeUserData = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch (error) {
    console.error("❌ Error removing user data:", error);
  }
};

export const clearAuthData = async (): Promise<void> => {
  await Promise.all([
    removeToken(),
    removeUserData(),
  ]);
  console.log('✅ All auth data cleared');
};

// --- CLEAR ALL AUTH DATA ---
export const clearAllAppData = async (): Promise<void> => {
  await Promise.all([
    removeToken(),
    removeUserData(),
    removeUserPreferences(),
    resetOnboarding(),
  ]);
  console.log("✅ All app data cleared");
};
