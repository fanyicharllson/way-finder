import React from "react";
import { View, Text, TextInput } from "react-native";

export const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  secureTextEntry,
  keyboardType = "default",
  icon,
  rightIcon,
  autoCapitalize = "none",
}) => {
  return (
    <View className="mb-5">
      <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2 ml-1">
        {label}
      </Text>
      <View
        className={`flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 border-2 ${
          error ? "border-red-500" : "border-transparent dark:border-gray-700"
        }`}
      >
        <View className="mr-3">{icon}</View>
        <TextInput
          className="flex-1 h-14 text-gray-900 dark:text-white text-base"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error && <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>}
    </View>
  );
};
  export default InputField;
