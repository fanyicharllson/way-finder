import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "react-native";
import {
  useForgotPassword,
  useVerifyResetCode,
  useResetPassword,
} from "@/hooks/useAuth";

type Step = "email" | "code" | "password";

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const forgotPassword = useForgotPassword();
  const verifyCode = useVerifyResetCode();
  const resetPassword = useResetPassword();

  const [errors, setErrors] = useState<{
    email?: string;
    code?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setErrors({ email: "Email is required" });
      return false;
    }
    if (!emailRegex.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateCode = () => {
    if (!code) {
      setErrors({ code: "Verification code is required" });
      return false;
    }
    if (code.length !== 6) {
      setErrors({ code: "Code must be 6 digits" });
      return false;
    }
    setErrors({});
    return true;
  };

  const validatePassword = () => {
    const newErrors: typeof errors = {};

    if (!newPassword) {
      newErrors.password = "Password is required";
    } else if (newPassword.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async () => {
    if (!validateEmail()) return;

    try {
      await forgotPassword.mutateAsync(email);
      setCurrentStep("code");
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleVerifyCode = async () => {
    if (!validateCode()) return;

    try {
      await verifyCode.mutateAsync({ email, code });
      setCurrentStep("password");
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;

    try {
      await resetPassword.mutateAsync({ email, code, newPassword });
      // Navigate to login after successful reset
      router.replace("/screens/(auth)/login" as any);
    } catch (error) {
      // Error handled by hook
    }
  };

  const renderStepIndicator = () => (
    <View className="flex-row items-center justify-center mb-8">
      {/* Step 1 */}
      <View className="items-center">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${
            currentStep === "email"
              ? "bg-purple-600"
              : currentStep === "code" || currentStep === "password"
              ? "bg-green-500"
              : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          {currentStep === "email" ? (
            <Text className="text-white font-bold">1</Text>
          ) : (
            <Ionicons name="checkmark" size={20} color="white" />
          )}
        </View>
        <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Email
        </Text>
      </View>

      {/* Line */}
      <View
        className={`h-0.5 w-16 mx-2 ${
          currentStep === "code" || currentStep === "password"
            ? "bg-green-500"
            : "bg-gray-300 dark:bg-gray-700"
        }`}
      />

      {/* Step 2 */}
      <View className="items-center">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${
            currentStep === "code"
              ? "bg-purple-600"
              : currentStep === "password"
              ? "bg-green-500"
              : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          {currentStep === "password" ? (
            <Ionicons name="checkmark" size={20} color="white" />
          ) : (
            <Text
              className={`font-bold ${
                currentStep === "code" ? "text-white" : "text-gray-500"
              }`}
            >
              2
            </Text>
          )}
        </View>
        <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Verify
        </Text>
      </View>

      {/* Line */}
      <View
        className={`h-0.5 w-16 mx-2 ${
          currentStep === "password"
            ? "bg-green-500"
            : "bg-gray-300 dark:bg-gray-700"
        }`}
      />

      {/* Step 3 */}
      <View className="items-center">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${
            currentStep === "password"
              ? "bg-purple-600"
              : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          <Text
            className={`font-bold ${
              currentStep === "password" ? "text-white" : "text-gray-500"
            }`}
          >
            3
          </Text>
        </View>
        <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Reset
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "#FFFFFF" : "#000000"}
            />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 dark:text-white ml-4">
            Reset Password
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          {renderStepIndicator()}

          {/* Step 1: Email */}
          {currentStep === "email" && (
            <View>
              <View className="mb-6">
                <View className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 items-center justify-center self-center mb-4">
                  <Ionicons name="mail-outline" size={32} color="#9333EA" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                  Forgot Password?
                </Text>
                <Text className="text-gray-600 dark:text-gray-400 text-center">
                  Enter your email address and we'll send you a verification
                  code to reset your password.
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </Text>
                <View
                  className={`flex-row items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border ${
                    errors.email
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                  <TextInput
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setErrors({});
                    }}
                    placeholder="your@email.com"
                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                    className="flex-1 ml-3 text-gray-900 dark:text-white"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.email && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.email}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={handleSendCode}
                disabled={forgotPassword.isPending}
                className={`py-4 rounded-xl mb-4 ${
                  forgotPassword.isPending ? "bg-purple-400" : "bg-purple-600"
                }`}
                activeOpacity={0.7}
              >
                <Text className="text-white text-center font-bold text-lg">
                  {forgotPassword.isPending ? "Sending..." : "Send Code"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Verification Code */}
          {currentStep === "code" && (
            <View>
              <View className="mb-6">
                <View className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 items-center justify-center self-center mb-4">
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={32}
                    color="#9333EA"
                  />
                </View>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                  Enter Code
                </Text>
                <Text className="text-gray-600 dark:text-gray-400 text-center">
                  We've sent a 6-digit verification code to{"\n"}
                  <Text className="font-semibold">{email}</Text>
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </Text>
                <View
                  className={`flex-row items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border ${
                    errors.code
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Ionicons
                    name="keypad-outline"
                    size={20}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                  <TextInput
                    value={code}
                    onChangeText={(text) => {
                      // Only allow numbers
                      const numericCode = text.replace(/[^0-9]/g, "");
                      if (numericCode.length <= 6) {
                        setCode(numericCode);
                        setErrors({});
                      }
                    }}
                    placeholder="000000"
                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                    className="flex-1 ml-3 text-gray-900 dark:text-white text-2xl tracking-widest font-bold"
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
                {errors.code && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.code}
                  </Text>
                )}
              </View>

              <View className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mb-4 flex-row items-start">
                <Ionicons name="time-outline" size={18} color="#D97706" />
                <Text className="text-amber-700 dark:text-amber-300 text-xs ml-2 flex-1">
                  Code expires in 30 minutes. Didn't receive it? Check your spam
                  folder.
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleVerifyCode}
                disabled={verifyCode.isPending}
                className={`py-4 rounded-xl mb-3 ${
                  verifyCode.isPending ? "bg-purple-400" : "bg-purple-600"
                }`}
                activeOpacity={0.7}
              >
                <Text className="text-white text-center font-bold text-lg">
                  {verifyCode.isPending ? "Verifying..." : "Verify Code"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSendCode}
                disabled={forgotPassword.isPending}
                className="py-3"
                activeOpacity={0.7}
              >
                <Text className="text-purple-600 dark:text-purple-400 text-center font-semibold">
                  {forgotPassword.isPending ? "Sending..." : "Resend Code"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 3: New Password */}
          {currentStep === "password" && (
            <View>
              <View className="mb-6">
                <View className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 items-center justify-center self-center mb-4">
                  <Ionicons
                    name="lock-closed-outline"
                    size={32}
                    color="#10B981"
                  />
                </View>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                  Create New Password
                </Text>
                <Text className="text-gray-600 dark:text-gray-400 text-center">
                  Your new password must be different from your previous
                  password
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </Text>
                <View
                  className={`flex-row items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border ${
                    errors.password
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                  <TextInput
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      setErrors({});
                    }}
                    placeholder="Enter new password"
                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                    className="flex-1 ml-3 text-gray-900 dark:text-white"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={isDark ? "#9CA3AF" : "#6B7280"}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.password}
                  </Text>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </Text>
                <View
                  className={`flex-row items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setErrors({});
                    }}
                    placeholder="Confirm new password"
                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                    className="flex-1 ml-3 text-gray-900 dark:text-white"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color={isDark ? "#9CA3AF" : "#6B7280"}
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </Text>
                )}
              </View>

              <View className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                <Text className="text-blue-900 dark:text-blue-300 text-xs font-semibold mb-1">
                  Password Requirements:
                </Text>
                <Text className="text-blue-700 dark:text-blue-400 text-xs">
                  • At least 8 characters long{"\n"}• Contains uppercase and
                  lowercase letters{"\n"}• Includes numbers
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={resetPassword.isPending}
                className={`py-4 rounded-xl mb-4 ${
                  resetPassword.isPending ? "bg-green-400" : "bg-green-600"
                }`}
                activeOpacity={0.7}
              >
                <Text className="text-white text-center font-bold text-lg">
                  {resetPassword.isPending ? "Resetting..." : "Reset Password"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Back to Login Link */}
          <TouchableOpacity
            onPress={() => router.replace("/screens/(auth)/login" as any)}
            className="py-4"
            activeOpacity={0.7}
          >
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              Remember your password?{" "}
              <Text className="text-purple-600 dark:text-purple-400 font-semibold">
                Back to Login
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
