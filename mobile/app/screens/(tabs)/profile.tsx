import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const ProfileScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl font-bold text-white">ProfileScreen</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({})