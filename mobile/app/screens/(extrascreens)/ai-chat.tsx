import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { router } from 'expo-router';
import { useAIChat } from '@/hooks/useAI';
import { ChatBubble } from '@/components/ai/ChatBubble';
import { ChatInput } from '@/components/ai/ChatInput';
import { EmptyState } from '@/components/ai/EmptyState';
import { TypingIndicator } from '@/components/ai/TypingIndicator';
import { Ionicons } from '@expo/vector-icons';

export default function AIChatScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const aiChat = useAIChat();

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chatHistory, isTyping]);

  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleSend = async (message: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: message,
      timestamp: getTimestamp(),
    };
    setChatHistory(prev => [...prev, userMessage]);

    // Show typing indicator
    setIsTyping(true);

    try {
      const response = await aiChat.mutateAsync({ message });
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: response.reply,
        timestamp: getTimestamp(),
      };

      // Add action if available
      if (response.action && response.actionData) {
        aiMessage.action = {
          type: response.action,
          data: response.actionData,
          label: getActionLabel(response.action),
        };
      }

      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: 'Sorry, I encountered an error. Please try again!',
        timestamp: getTimestamp(),
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'search_route':
        return 'Search Routes';
      case 'view_preferences':
        return 'View Preferences';
      default:
        return 'View Details';
    }
  };

  const handleAction = (action: any) => {
    if (action.type === 'search_route' && action.data) {
      router.push(`/screens/(extrascreens)/route-results?from=${encodeURIComponent(action.data.from)}&to=${encodeURIComponent(action.data.to)}`);
    }
    // Add more action handlers as needed
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View className="px-6 py-4 bg-white dark:bg-gray-900  border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.back()}
                className="mr-3"
              >
                <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
              <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3">
                <Ionicons name="sparkles" size={20} color="white" />
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  WayFinder AI
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Always here to help
                </Text>
              </View>
            </View>
            
            {chatHistory.length > 0 && (
              <TouchableOpacity
                onPress={() => setChatHistory([])}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
              >
                <Ionicons name="trash-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: chatHistory.length === 0 ? 'center' : 'flex-start',
          }}
        >
          {chatHistory.length === 0 ? (
            <EmptyState onSuggestionPress={handleSend} />
          ) : (
            <>
              {chatHistory.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  role={msg.role}
                  text={msg.text}
                  timestamp={msg.timestamp}
                  isDark={isDark}
                  actionLabel={msg.action?.label}
                  onActionPress={msg.action ? () => handleAction(msg.action) : undefined}
                />
              ))}
              {isTyping && <TypingIndicator />}
            </>
          )}
        </ScrollView>

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          isLoading={isTyping}
          isDark={isDark}
        />

        {/* AI Disclaimer */}
        <View className="px-6 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
          <View className="flex-row items-center">
            <Ionicons name="information-circle" size={16} color="#F59E0B" />
            <Text className="text-xs text-yellow-800 dark:text-yellow-400 ml-2 flex-1">
              AI responses are powered by Gemini and may not always be accurate. Please verify important information.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}