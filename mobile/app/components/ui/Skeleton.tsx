// components/ui/Skeleton.tsx
import React from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E5E7EB',
        },
        animatedStyle,
        style,
      ]}
      className="dark:bg-gray-700"
    />
  );
};

export const SkeletonCard: React.FC = () => (
  <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3">
    <View className="flex-row items-center">
      <Skeleton width={48} height={48} borderRadius={12} />
      <View className="flex-1 ml-3">
        <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={14} />
      </View>
      <Skeleton width={60} height={20} />
    </View>
  </View>
);

export const SkeletonAnalyticsCard: React.FC = () => (
  <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mr-3" style={{ width: 160 }}>
    <Skeleton width={32} height={32} borderRadius={8} style={{ marginBottom: 12 }} />
    <Skeleton width="80%" height={24} style={{ marginBottom: 8 }} />
    <Skeleton width="60%" height={14} />
  </View>
);