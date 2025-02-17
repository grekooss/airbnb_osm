import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categories } from '../constants/categories';
import { useCategory } from '../context/CategoryContext';

type Category = {
  label: string;
  description: string;
  icon: string;
};

const ExploreHeader = () => {
  const { activeCategory, setActiveCategory } = useCategory();

  return (
    <SafeAreaView className="border-b border-gray-200">
      <View className="mx-5 mt-4">
        <Link href="/(root)/(modals)/booking" asChild>
          <TouchableOpacity className="flex-row items-center gap-2 rounded-full bg-white p-3 shadow-lg">
            <View className="pl-3">
              <Ionicons name="search" size={24} />
            </View>
            <View className="pl-1">
              <Text className="text-sm font-semibold">Where to?</Text>
              <Text className="text-xs text-gray-500">
                Anywhere · Any week · Add guests
              </Text>
            </View>

            <View className="ml-auto">
              <TouchableOpacity className="rounded-full border border-gray-200 p-2">
                <Ionicons name="options-outline" size={24} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Link>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          gap: 16,
          paddingVertical: 5,
        }}
      >
        {categories.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setActiveCategory(item.label)}
            className={`mt-2 items-center justify-center border-b-[1px] ${
              activeCategory === item.label
                ? 'border-black'
                : 'border-transparent'
            }`}
            style={{ minWidth: 50 }}
          >
            <Ionicons
              name={item.icon as any}
              size={24}
              color={activeCategory === item.label ? '#000' : '#6b7280'}
            />
            <Text
              className={`mt-1 text-xs ${
                activeCategory === item.label ? 'text-black' : 'text-gray-500'
              }`}
            >
              {item.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExploreHeader;
