import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  Pressable,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { showToast } from "@/utils/toast";
import {
  useFavorites,
  useRemoveFavorite,
  useUpdateFavorite,
} from "@/hooks/useFavorite";
import { FloatingActionButton } from "@/app/components/ui/FloatingActionButton";
import { AIFloatingButton } from "@/app/components/ui/AIFloatingButton";
import { AddFavoriteModal } from "@/app/components/favorite/AddFavoriteModal";

interface FavoriteScreenProps {
  onSelectFavorite?: (favorite: any) => void;
}

const FavoriteScreen: React.FC<FavoriteScreenProps> = ({
  onSelectFavorite,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddFavorite, setShowAddFavorite] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  const { data, isLoading, isError, refetch } = useFavorites();
  const removeFavorite = useRemoveFavorite();
  const updateFavorite = useUpdateFavorite();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleEdit = (favorite: any) => {
    setEditingId(favorite.id);
    setEditName(favorite.name);
    setEditNotes(favorite.notes || "");
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      await updateFavorite.mutateAsync({
        id: editingId,
        data: {
          name: editName,
          notes: editNotes || undefined,
        },
      });

      showToast({
        type: "success",
        text1: "Updated",
        text2: "Favorite route updated successfully",
      });

      setShowEditModal(false);
      setEditingId(null);
    } catch (error) {
      showToast({
        type: "error",
        text1: "Error",
        text2: "Failed to update favorite",
      });
    }
  };

  const handleDelete = (favoriteId: string, name: string) => {
    Alert.alert(
      "Remove Favorite",
      `Are you sure you want to remove "${name}" from favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeFavorite.mutateAsync(favoriteId);
              showToast({
                type: "success",
                text1: "Removed",
                text2: "Favorite route removed",
              });
            } catch (error) {
              showToast({
                type: "error",
                text1: "Error",
                text2: "Failed to remove favorite",
              });
            }
          },
        },
      ]
    );
  };

  const handleSelectFavorite = (favorite: any) => {
    if (onSelectFavorite) {
      onSelectFavorite(favorite);
    }
  };

  const handleAddFavorite = () => {
    setShowAddFavorite(true);
  };

  const handleAIPress = () => {
    setShowAIModal(true);
    showToast({
      type: "info",
      text1: "AI Assistant",
      text2: "AI features coming soon!",
    });
  };
  

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="px-6 pt-6 pb-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <Skeleton width="40%" height={28} style={{ marginBottom: 8 }} />
          <Skeleton width="30%" height={16} />
        </View>

        <ScrollView className="px-6 mt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 border border-gray-200 dark:border-gray-700"
            >
              <View className="flex-row items-start mb-3">
                <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
                <View className="flex-1">
                  <Skeleton width="60%" height={18} style={{ marginBottom: 8 }} />
                  <Skeleton width="80%" height={14} />
                </View>
              </View>
              <View className="flex-row justify-between mt-2">
                <Skeleton width="30%" height={14} />
                <Skeleton width="20%" height={14} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 justify-center items-center px-6">
        <Ionicons
          name="alert-circle"
          size={64}
          color={isDark ? "#EF4444" : "#DC2626"}
        />
        <Text className="text-gray-900 dark:text-white font-bold text-xl mt-4">
          Failed to Load
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-center mt-2">
          Unable to load your favorite routes
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="mt-6 bg-blue-600 dark:bg-blue-500 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data || data.favorites.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="px-6 pt-6 pb-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-gray-900 dark:text-white font-bold text-2xl">
            Favorites
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mt-1">
            Quick access to your saved routes
          </Text>
        </View>

        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-8 items-center w-full max-w-sm">
            <View className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-6 mb-4">
              <Ionicons
                name="heart-outline"
                size={48}
                color={isDark ? "#60A5FA" : "#2563EB"}
              />
            </View>
            <Text className="text-gray-900 dark:text-white font-bold text-xl text-center">
              No Favorites Yet
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center mt-2">
              Save your frequently used routes for quick access
            </Text>
            <View className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 w-full">
              <View className="flex-row items-start mb-3">
                <View className="bg-blue-100 dark:bg-blue-900/50 rounded-full w-6 h-6 items-center justify-center mr-3 mt-0.5">
                  <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs">
                    1
                  </Text>
                </View>
                <Text className="text-gray-700 dark:text-gray-300 flex-1">
                  Search for a route on the home screen
                </Text>
              </View>
              <View className="flex-row items-start">
                <View className="bg-blue-100 dark:bg-blue-900/50 rounded-full w-6 h-6 items-center justify-center mr-3 mt-0.5">
                  <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs">
                    2
                  </Text>
                </View>
                <Text className="text-gray-700 dark:text-gray-300 flex-1">
                  Tap the heart icon to add it to favorites
                </Text>
              </View>
            </View>
          </View>
        </View>

        <AddFavoriteModal
          visible={showAddFavorite}
          onClose={() => setShowAddFavorite(false)}
          isDark={isDark}
        />

        {/* Floating Action Buttons */}
        <FloatingActionButton
          onPress={handleAddFavorite}
          icon="add"
          visible={true}
          bottom={24}
          right={24}
          testID="add-favorite-fab"
        />

        <AIFloatingButton
          onPress={handleAIPress}
          visible={true}
          bottom={92}
          right={24}
          testID="ai-fab"
        />
      </View>
    );
  }

  return (
    <>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="px-6 pt-6 pb-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center justify-between mt-7">
            <View className="flex-1">
              <Text className="text-gray-900 dark:text-white font-bold text-2xl">
                My Favorites
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 mt-1">
                {data.count} saved {data.count === 1 ? "route" : "routes"}
              </Text>
            </View>
            <TouchableOpacity onPress={() => refetch()} className="p-2">
              <Ionicons
                name="refresh"
                size={24}
                color={isDark ? "#60A5FA" : "#2563EB"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        >
          {data.favorites.map((favorite) => (
            <TouchableOpacity
              key={favorite.id}
              onPress={() => handleSelectFavorite(favorite)}
              activeOpacity={0.7}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 border border-gray-200 dark:border-gray-700"
            >
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center mb-1">
                    <Ionicons
                      name="heart"
                      size={16}
                      color="#EF4444"
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      className="text-gray-900 dark:text-white font-bold text-base flex-1"
                      numberOfLines={1}
                    >
                      {favorite.name}
                    </Text>
                  </View>
                  {favorite.notes && (
                    <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      {favorite.notes}
                    </Text>
                  )}
                </View>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => handleEdit(favorite)}
                    className="p-2 mr-1"
                  >
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color={isDark ? "#9CA3AF" : "#6B7280"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(favorite.id, favorite.name)}
                    className="p-2"
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={isDark ? "#EF4444" : "#DC2626"}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <View className="flex-row items-center mb-2">
                  <View className="bg-green-100 dark:bg-green-900/30 rounded-full w-8 h-8 items-center justify-center">
                    <Ionicons name="location" size={16} color="#10B981" />
                  </View>
                  <Text
                    className="text-gray-900 dark:text-white font-medium text-sm ml-3 flex-1"
                    numberOfLines={1}
                  >
                    {favorite.fromAddress}
                  </Text>
                </View>

                <View className="flex-row items-center ml-4 my-1">
                  <View className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                </View>

                <View className="flex-row items-center">
                  <View className="bg-red-100 dark:bg-red-900/30 rounded-full w-8 h-8 items-center justify-center">
                    <Ionicons name="location" size={16} color="#EF4444" />
                  </View>
                  <Text
                    className="text-gray-900 dark:text-white font-medium text-sm ml-3 flex-1"
                    numberOfLines={1}
                  >
                    {favorite.toAddress}
                  </Text>
                </View>
              </View>

              {favorite.preferredMode && (
                <View className="flex-row items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Ionicons
                    name={
                      favorite.preferredMode === "bus"
                        ? "bus"
                        : favorite.preferredMode === "moto"
                        ? "bicycle"
                        : favorite.preferredMode === "taxi"
                        ? "car"
                        : "walk"
                    }
                    size={16}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                  <Text className="text-gray-600 dark:text-gray-400 text-sm ml-2">
                    Preferred:{" "}
                    {favorite.preferredMode.charAt(0).toUpperCase() +
                      favorite.preferredMode.slice(1)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowEditModal(false)}
        >
          <Pressable
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl pb-8"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="pt-6 px-6">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-gray-900 dark:text-white font-bold text-xl">
                  Edit Favorite
                </Text>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Name
                </Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter route name"
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                />
              </View>

              <View className="mb-6">
                <Text className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Notes (Optional)
                </Text>
                <TextInput
                  value={editNotes}
                  onChangeText={setEditNotes}
                  placeholder="Add notes about this route"
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                />
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 py-4 rounded-full"
                >
                  <Text className="text-gray-900 dark:text-white font-semibold text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveEdit}
                  disabled={updateFavorite.isPending || !editName.trim()}
                  className="flex-1 bg-blue-600 dark:bg-blue-500 py-4 rounded-full"
                >
                  {updateFavorite.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-semibold text-center">
                      Save
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <AddFavoriteModal
        visible={showAddFavorite}
        onClose={() => setShowAddFavorite(false)}
        isDark={isDark}
      />

      {/* Floating Action Buttons */}
      <FloatingActionButton
        onPress={handleAddFavorite}
        icon="add"
        visible={true}
        bottom={24}
        right={24}
        testID="add-favorite-fab"
      />

      <AIFloatingButton
        onPress={handleAIPress}
        visible={true}
        bottom={92}
        right={24}
        testID="ai-fab"
      />
    </>
  );
};

export default FavoriteScreen;
