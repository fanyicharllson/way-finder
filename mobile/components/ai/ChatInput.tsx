import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading, isDark }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <View className="px-4 pb-4 pt-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <View className="flex-row items-center">
        {/* Input Field */}
        <View className="flex-1 flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 mr-2">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Ask me anything..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 h-12 text-gray-900 dark:text-white text-base"
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          
          {/* Character count for long messages */}
          {message.length > 400 && (
            <Text className="text-gray-400 text-xs mr-2">
              {message.length}/500
            </Text>
          )}
        </View>

        {/* Send Button */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={!message.trim() || isLoading}
          className={`w-12 h-12 rounded-full items-center justify-center ${
            message.trim() && !isLoading ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'
          }`}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons
              name="send"
              size={20}
              color={message.trim() ? 'white' : '#9CA3AF'}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
