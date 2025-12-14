// components/history/FilterModal.tsx
import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const filterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  modes: z.array(z.string()),
  minCost: z.number().optional(),
  maxCost: z.number().optional(),
});

type FilterFormData = z.infer<typeof filterSchema>;

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterFormData) => void;
  isDark: boolean;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  isDark,
}) => {
  const { control, handleSubmit, watch, setValue } = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      modes: [],
    },
  });

  const selectedModes = watch('modes');

  const transportModes = [
    { id: 'bus', label: 'Bus', icon: 'bus' },
    { id: 'moto', label: 'Moto', icon: 'bicycle' },
    { id: 'taxi', label: 'Taxi', icon: 'car' },
    { id: 'walk', label: 'Walk', icon: 'walk' },
  ];

  const toggleMode = (mode: string) => {
    const current = selectedModes || [];
    if (current.includes(mode)) {
      setValue('modes', current.filter((m) => m !== mode));
    } else {
      setValue('modes', [...current, mode]);
    }
  };

  const onSubmit = (data: FilterFormData) => {
    onApply(data);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50" onPress={onClose}>
        <Pressable
          className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl pb-8"
          style={{ maxHeight: '80%' }}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView className="pt-6 px-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-gray-900 dark:text-white font-bold text-xl">
                Filter Trips
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            {/* Transport Mode Filter */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 font-medium mb-3">
                Transport Mode
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {transportModes.map((mode) => (
                  <TouchableOpacity
                    key={mode.id}
                    onPress={() => toggleMode(mode.id)}
                    className={`flex-row items-center px-4 py-3 rounded-xl border ${
                      selectedModes?.includes(mode.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <Ionicons
                      name={mode.icon as any}
                      size={20}
                      color={
                        selectedModes?.includes(mode.id)
                          ? '#3B82F6'
                          : isDark
                          ? '#9CA3AF'
                          : '#6B7280'
                      }
                    />
                    <Text
                      className={`ml-2 font-medium ${
                        selectedModes?.includes(mode.id)
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={() => {
                  setValue('modes', []);
                  setValue('startDate', undefined);
                  setValue('endDate', undefined);
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 py-4 rounded-full"
              >
                <Text className="text-gray-900 dark:text-white font-semibold text-center">
                  Clear All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                className="flex-1 bg-blue-600 dark:bg-blue-500 py-4 rounded-full"
              >
                <Text className="text-white font-semibold text-center">Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};