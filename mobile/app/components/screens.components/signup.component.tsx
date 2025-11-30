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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useColorScheme } from "nativewind";
import { RegisterFormData, registerSchema } from "@/utils/form.validation.util";
import { InputField } from "@/app/components/form.input.component";

// --- ICON COMPONENTS ---
const EyeIcon: React.FC<{ visible: boolean }> = ({ visible }) => (
  <Text className="text-2xl">{visible ? "👁️" : "🙈"}</Text>
);

const UserIcon = () => <Text className="text-xl">👤</Text>;
const EmailIcon = () => <Text className="text-xl">📧</Text>;
const PhoneIcon = () => <Text className="text-xl">📱</Text>;
const LockIcon = () => <Text className="text-xl">🔒</Text>;


// --- MAIN REGISTER SCREEN ---
const RegisterScreenComponent: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { colorScheme } = useColorScheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema as any),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    // Transform to DTO format (remove confirmPassword)
    const registerDTO: RegisterDTO = {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      password: data.password,
    };

    try {
      // TODO: Replace with actual API call
      console.log("Registering user:", registerDTO);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock success
      console.log("Registration successful!");
      onRegisterSuccess();
    } catch (error) {
      console.error("Registration error:", error);
      // TODO: Show error toast/alert
    } finally {
      setIsLoading(false);
    }
  };

  const isDark = colorScheme === "dark";

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
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View className="mb-8">
              <Text className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Create Account
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400">
                Join WayFinder to start your smart commute journey
              </Text>
            </View>

            {/* Form Fields */}
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  icon={<UserIcon />}
                  autoCapitalize="words"
                />
              )}
            />

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
                  icon={<EmailIcon />}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Phone Number (Optional)"
                  placeholder="+237 6XX XXX XXX"
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                  keyboardType="phone-pad"
                  icon={<PhoneIcon />}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Password"
                  placeholder="Create a strong password"
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry={!showPassword}
                  icon={<LockIcon />}
                  rightIcon={
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <EyeIcon visible={showPassword} />
                    </TouchableOpacity>
                  }
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  secureTextEntry={!showConfirmPassword}
                  icon={<LockIcon />}
                  rightIcon={
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <EyeIcon visible={showConfirmPassword} />
                    </TouchableOpacity>
                  }
                />
              )}
            />

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              activeOpacity={0.8}
              className="w-full h-16 rounded-2xl items-center justify-center mb-6 mt-4"
              style={{
                backgroundColor: "#3b82f6",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              {isLoading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                  size="small"
                />
              ) : (
                <Text className="text-white text-lg font-bold">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
              <Text className="mx-4 text-gray-500 dark:text-gray-400 text-sm">
                or continue with
              </Text>
              <View className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
            </View>

            {/* Social Login Buttons */}
            <View className="flex-row justify-between mb-6">
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-1 mr-2 h-14 bg-white dark:bg-gray-800 rounded-2xl items-center justify-center flex-row border-2 border-gray-200 dark:border-gray-700"
              >
                <Text className="text-2xl mr-2">🍎</Text>
                <Text className="text-gray-900 dark:text-white font-semibold">
                  Apple
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-1 ml-2 h-14 bg-white dark:bg-gray-800 rounded-2xl items-center justify-center flex-row border-2 border-gray-200 dark:border-gray-700"
              >
                <Text className="text-2xl mr-2">🔍</Text>
                <Text className="text-gray-900 dark:text-white font-semibold">
                  Google
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View className="flex-row justify-center mb-8">
              <Text className="text-gray-600 dark:text-gray-400 text-base">
                Already have an account?
              </Text>
              <TouchableOpacity onPress={onNavigateToLogin}>
                <Text className="text-blue-600 dark:text-blue-400 font-semibold text-base">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms & Privacy */}
            <Text className="text-center text-gray-500 dark:text-gray-500 text-xs mb-8 px-4">
              By continuing, you agree to WayFinder&apos;s
              <Text className="underline">Terms of Service</Text> and
              <Text className="underline">Privacy Policy</Text>
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default RegisterScreenComponent;
