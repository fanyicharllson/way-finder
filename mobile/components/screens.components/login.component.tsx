/* eslint-disable import/no-named-as-default */
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useColorScheme } from "nativewind";
import InputField from "@/components/form.input.component";
import { LoginFormData, loginSchema } from "@/utils/form.validation.util";
import { useLogin } from "@/hooks/useAuth";

// --- ICON COMPONENTS ---
const EyeIcon: React.FC<{ visible: boolean; color: string }> = ({
  visible,
  color,
}) => (
  <Ionicons name={visible ? "eye" : "eye-off"} size={24} color={color} />
);

const EmailIcon: React.FC<{ color: string }> = ({ color }) => (
  <Ionicons name="mail-outline" size={22} color={color} />
);

const LockIcon: React.FC<{ color: string }> = ({ color }) => (
  <Ionicons name="lock-closed-outline" size={22} color={color} />
);

// --- MAIN LOGIN SCREEN ---
const LoginScreenComponent: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onLoginSuccess,
  onForgotPassword,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { colorScheme } = useColorScheme();
  const loginMutation = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema as any),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const loginDTO: LoginDTO = {
      email: data.email,
      password: data.password,
    };

    loginMutation.mutate(loginDTO, {
      onSuccess: () => {
        // Navigate to main app
        onLoginSuccess();
      },
    });
  };

  const isDark = colorScheme === "dark";
  const isLoading = loginMutation.isPending;
  const iconColor = isDark ? "#E5E7EB" : "#111827";
  const socialIconColor = isDark ? "#F3F4F6" : "#111827";

  return (
    <LinearGradient
      colors={isDark ? ["#0A0F1A", "#1a2332"] : ["#F9FAFB", "#FFFFFF"]}
      style={{ flex: 1 }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0A0F1A" : "#F9FAFB"}
        translucent
      />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View className="mb-12">
              <Text className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
                Welcome Back
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400">
                Sign in to continue your journey with WayFinder
              </Text>
            </View>

            {/* Form Fields */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Email Address"
                  placeholder="example@email.com"
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  icon={<EmailIcon color={iconColor} />}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Password"
                  placeholder="Enter your password"
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry={!showPassword}
                  icon={<LockIcon color={iconColor} />}
                  rightIcon={
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <EyeIcon visible={showPassword} color={iconColor} />
                    </TouchableOpacity>
                  }
                />
              )}
            />

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={onForgotPassword}
              className="self-end mb-8"
              activeOpacity={0.7}
            >
              <Text className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              activeOpacity={0.8}
              className="w-full h-16 rounded-2xl items-center justify-center mb-6"
              style={{
                backgroundColor: isDark ? "#FFFFFF" : "#0A0F1A",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              {isLoading ? (
                <ActivityIndicator
                  color={isDark ? "#0A0F1A" : "#FFFFFF"}
                  size="small"
                />
              ) : (
                <Text
                  className="text-lg font-bold"
                  style={{ color: isDark ? "#0A0F1A" : "#FFFFFF" }}
                >
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            {/* <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
              <Text className="mx-4 text-gray-500 dark:text-gray-400 text-sm">
                or continue with
              </Text>
              <View className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
            </View> */}

            {/* Social Login Buttons */}
            {/* <View className="flex-row justify-between mb-8">
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-1 mr-2 h-14 bg-white dark:bg-gray-800 rounded-2xl items-center justify-center flex-row border-2 border-gray-200 dark:border-gray-700"
              >
                <AntDesign name="apple" size={22} color={socialIconColor} style={{ marginRight: 8 }} />
                <Text className="text-gray-900 dark:text-white font-semibold">
                  Apple
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-1 ml-2 h-14 bg-white dark:bg-gray-800 rounded-2xl items-center justify-center flex-row border-2 border-gray-200 dark:border-gray-700"
              >
                <AntDesign name="google" size={22} color={socialIconColor} style={{ marginRight: 8 }} />
                <Text className="text-gray-900 dark:text-white font-semibold">
                  Google
                </Text>
              </TouchableOpacity>
            </View> */}

            {/* Register Link */}
            <View className="flex-row justify-center mb-8">
              <Text className="text-gray-600 dark:text-gray-400 text-base">
                Don&apos;t have an account?{" "}
              </Text>
              <TouchableOpacity onPress={onNavigateToRegister}>
                <Text className="text-blue-600 dark:text-blue-400 font-semibold text-base">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreenComponent;
