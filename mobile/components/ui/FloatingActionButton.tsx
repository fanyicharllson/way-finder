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

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  visible?: boolean;
  bottom?: number;
  right?: number;
  testID?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = "add",
  iconSize = 24,
  visible = true,
  bottom = 24,
  right = 24,
  testID,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Entrance animation on mount - DISABLED FOR VISIBILITY
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
      { scale: Animated.multiply(scaleAnim, Animated.multiply(pressAnim, pulseAnim)) },
      { translateY: translateYAnim },
    ],
  };

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
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        <View style={styles.button}>
          <Ionicons name={icon} size={iconSize} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 9999,
    elevation: 10,
  },
  touchable: {
    borderRadius: 28,
    overflow: "visible",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
      },
    }),
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#06B6D4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
});
