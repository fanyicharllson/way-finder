import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export const TypingIndicator: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  const scale = (dot: Animated.Value) => ({
    transform: [
      {
        scale: dot.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.3],
        }),
      },
    ],
  });

  return (
    <View className="mb-4 items-start">
      <View className="flex-row items-start mb-2">
        <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center mr-2">
          <Ionicons name="sparkles" size={16} color="white" />
        </View>
      </View>
      
      <View className="bg-gray-100 dark:bg-gray-800 rounded-3xl rounded-tl-sm px-5 py-4">
        <View className="flex-row gap-1">
          <Animated.View
            style={[scale(dot1)]}
            className="w-2 h-2 rounded-full bg-gray-400"
          />
          <Animated.View
            style={[scale(dot2)]}
            className="w-2 h-2 rounded-full bg-gray-400"
          />
          <Animated.View
            style={[scale(dot3)]}
            className="w-2 h-2 rounded-full bg-gray-400"
          />
        </View>
      </View>
    </View>
  );
};
