import Toast from "react-native-toast-message";

export interface ToastConfig {
  type: "success" | "error" | "info" | "warning";
  text1: string;
  text2?: string;
  duration?: number;
  position?: "top" | "bottom";
}

export const showToast = ({
  type,
  text1,
  text2,
  duration = 3000,
  position = "top",
}: ToastConfig) => {
  Toast.show({
    type,
    text1,
    text2,
    position,
    visibilityTime: duration,
    topOffset: 60,
    bottomOffset: 40,
  });
};
