import React, { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PreferencesFloatingButtonProps {
  onPress: () => void;
  visible?: boolean;
  bottom?: number;
  right?: number;
  testID?: string;
}

export const PreferencesFloatingButton: React.FC<PreferencesFloatingButtonProps> = ({
  onPress,
  visible = true,
  bottom = 20,
  right = 2,
  testID,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

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
      toValue: 0.9,
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

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom,
          right,
          transform: [{ translateY: translateYAnim }, { scale: pressAnim }],
        },
      ]}
    >
      <TouchableOpacity
        testID={testID}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.button}
      >
        <Ionicons name="options" size={24} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 999,
    ...Platform.select({
      ios: {
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 28,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
  },
});
