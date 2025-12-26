import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAIRecommendation } from '@/hooks/useAI';
import { router } from 'expo-router';

interface SmartSuggestionProps {
  isDark: boolean;
}

export function SmartSuggestion({ isDark }: SmartSuggestionProps) {
  const aiRecommendation = useAIRecommendation();
  const [suggestionHistory, setSuggestionHistory] = useState<string[]>([]);

  const handleGetSuggestion = () => {
    aiRecommendation.mutate('Give me a quick commute suggestion based on my recent trips', {
      onSuccess: (data) => {
        setSuggestionHistory(prev => [data.reply, ...prev.slice(0, 2)]);
      }
    });
  };

  const handleActionPress = (action: any) => {
    if (action?.type === 'search_route' && action.data) {
      router.push(
        `/screens/(extrascreens)/route-results?from=${encodeURIComponent(action.data.origin)}&to=${encodeURIComponent(action.data.destination)}`
      );
    }
  };

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="bulb" size={16} color="#A855F7" />
          </View>
          <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>
            Smart Suggestion
          </Text>
        </View>
        
        <View style={[styles.badge, isDark ? styles.badgeDark : styles.badgeLight]}>
          <Text style={[styles.badgeText, isDark ? styles.badgeTextDark : styles.badgeTextLight]}>
            AI Powered
          </Text>
        </View>
      </View>

      {aiRecommendation.isPending ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#A855F7" />
          <Text style={[styles.loadingText, isDark ? styles.loadingTextDark : styles.loadingTextLight]}>
            AI Analyzing your trips...
          </Text>
        </View>
      ) : aiRecommendation.data ? (
        <View>
          <Text style={[styles.suggestionText, isDark ? styles.suggestionTextDark : styles.suggestionTextLight]}>
            {aiRecommendation.data.reply}
          </Text>
          
          {aiRecommendation.data.action === 'search_route' && aiRecommendation.data.actionData && (
            <TouchableOpacity
              onPress={() => handleActionPress(aiRecommendation.data)}
              style={styles.actionButton}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate" size={18} color="white" />
              <Text style={styles.actionButtonText}>
                Search This Route
              </Text>
            </TouchableOpacity>
          )}

          {/* Suggestion History */}
          {suggestionHistory.length > 1 && (
            <View style={[styles.historyContainer, isDark ? styles.historyContainerDark : styles.historyContainerLight]}>
              <Text style={[styles.historyTitle, isDark ? styles.historyTitleDark : styles.historyTitleLight]}>
                Previous Suggestions:
              </Text>
              {suggestionHistory.slice(1, 3).map((suggestion, index) => (
                <View key={index} style={styles.historyItem}>
                  <Text style={[styles.historyBullet, isDark ? styles.historyTextDark : styles.historyTextLight]}>• </Text>
                  <Text 
                    style={[styles.historyText, isDark ? styles.historyTextDark : styles.historyTextLight]} 
                    numberOfLines={1}
                  >
                    {suggestion}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleGetSuggestion}
          style={[styles.primaryButton, styles.buttonShadow]}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={18} color="white" />
          <Text style={styles.primaryButtonText}>
            Get Smart Suggestion
          </Text>
        </TouchableOpacity>
      )}
      
      {aiRecommendation.isError && (
        <View style={[styles.errorContainer, isDark ? styles.errorContainerDark : styles.errorContainerLight]}>
          <Text style={[styles.errorText, isDark ? styles.errorTextDark : styles.errorTextLight]}>
            Couldn't generate suggestion. Please try again.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#1F2937',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleLight: {
    color: '#111827',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  
  // Badge
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeLight: {
    backgroundColor: '#F3E8FF',
  },
  badgeDark: {
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextLight: {
    color: '#9333EA',
  },
  badgeTextDark: {
    color: '#C084FC',
  },
  
  // Loading
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    marginTop: 8,
  },
  loadingTextLight: {
    color: '#6B7280',
  },
  loadingTextDark: {
    color: '#9CA3AF',
  },
  
  // Suggestion Text
  suggestionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  suggestionTextLight: {
    color: '#374151',
  },
  suggestionTextDark: {
    color: '#D1D5DB',
  },
  
  // Action Button
  actionButton: {
    backgroundColor: '#A855F7',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Primary Button
  primaryButton: {
    backgroundColor: '#A855F7',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonShadow: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  
  // History
  historyContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  historyContainerLight: {
    borderTopColor: '#E5E7EB',
  },
  historyContainerDark: {
    borderTopColor: '#374151',
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  historyTitleLight: {
    color: '#6B7280',
  },
  historyTitleDark: {
    color: '#9CA3AF',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  historyBullet: {
    fontSize: 12,
  },
  historyText: {
    fontSize: 12,
    flex: 1,
  },
  historyTextLight: {
    color: '#9CA3AF',
  },
  historyTextDark: {
    color: '#6B7280',
  },
  
  // Error
  errorContainer: {
    padding: 12,
    borderRadius: 12,
  },
  errorContainerLight: {
    backgroundColor: '#FEF2F2',
  },
  errorContainerDark: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
  },
  errorText: {
    fontSize: 14,
  },
  errorTextLight: {
    color: '#DC2626',
  },
  errorTextDark: {
    color: '#FCA5A5',
  },
});
