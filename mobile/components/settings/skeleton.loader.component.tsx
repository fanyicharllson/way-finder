import { View } from "react-native";

const SkeletonLoader = () => (
  <View className="px-4">
    {/* Account Section Skeleton */}
    <View className="mb-4 mt-2">
      <View className="px-4 py-4 bg-white dark:bg-gray-800 rounded-lg">
        <View className="flex-row items-center">
          {/* Avatar Skeleton */}
          <View className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mr-3 animate-pulse" />
          <View className="flex-1">
            {/* Name Skeleton */}
            <View className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse" />
            {/* Email Skeleton */}
            <View className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
          </View>
        </View>
      </View>
    </View>

    {/* Settings Items Skeleton */}
    {[1, 2, 3, 4, 5].map((item) => (
      <View
        key={item}
        className="flex-row items-center px-4 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700"
      >
        <View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-3 animate-pulse" />
        <View className="flex-1">
          <View className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse" />
          <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
        </View>
      </View>
    ))}
  </View>
);

export default SkeletonLoader;
