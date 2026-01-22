import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLogout, useProfile } from "@/hooks/useAuth";

const ProfileScreen = () => {
  const { data: user, isLoading, isError } = useProfile();
  const logout = useLogout();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <View className="flex-1 items-center justify-center mt-16">
          <Image
            source={{
              uri: "https://ui-avatars.com/api/?name=WayFinder&background=0A0F1A&color=fff",
            }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              marginBottom: 16,
            }}
          />
          <Text className="text-2xl font-bold text-white mb-2">
            {user?.name || "User"}
          </Text>
          <Text className="text-base text-gray-300 mb-6">
            {user?.email || "No email found"}
          </Text>
          <TouchableOpacity
            className="bg-blue-600 px-6 py-2 rounded-full"
            onPress={() => logout.mutate()}
          >
            <Text className="text-white font-semibold">Logout</Text>
          </TouchableOpacity>
          {isLoading && <Text className="mt-4 text-gray-400">Loading...</Text>}
          {isError && (
            <Text className="mt-4 text-red-400">Failed to load profile.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({});