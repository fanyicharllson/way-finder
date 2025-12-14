import React, { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  Animated,
  View,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface AIFloatingButtonProps {
  onPress: () => void;
  visible?: boolean;
  bottom?: number;
  right?: number;
  testID?: string;
}

export const AIFloatingButton: React.FC<AIFloatingButtonProps> = ({
  onPress,
  visible = true,
  bottom = 100, // Higher than regular FAB
  right = 24,
  testID,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Skip entrance animation - start visible immediately
    return () => {};
  }, []);

  // Visibility animation
  useEffect(() => {
    Animated.spring(translateYAnim, {
      toValue: visible ? 0 : 100,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 1.1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [
      { scale: Animated.multiply(scaleAnim, pressAnim) },
      { translateY: translateYAnim },
    ],
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom, right },
        animatedStyle,
      ]}
      pointerEvents="box-none"
      testID={testID}
    >
      {/* Glow Effect */}
      <Animated.View
        style={[
          styles.glowContainer,
          {
            opacity: glowOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={["#A855F7", "#EC4899", "#F59E0B"]} // Purple to Pink to Amber
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glow}
        />
      </Animated.View>

      {/* Main Button */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        <View style={styles.button}>
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 9998,
    elevation: 10,
  },
  glowContainer: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
  },
  glow: {
    width: 56,
    height: 56,
    borderRadius: 28,
    opacity: 0.5,
    ...Platform.select({
      ios: {
        shadowColor: "#A855F7",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  touchable: {
    borderRadius: 24,
    overflow: "visible",
    ...Platform.select({
      ios: {
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: "0 4px 8px rgba(139, 92, 246, 0.4)",
      },
    }),
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#A855F7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
