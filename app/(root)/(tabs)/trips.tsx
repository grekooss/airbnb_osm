import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TripsPage = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-6">
        <Text className="text-4xl font-bold mb-8">
          Podróże
        </Text>
        <Text className="text-xl font-bold  mb-6">
          Na razie nie masz tu żadnych podróży
        </Text>
        <Text className="text-base text-gray-600 mb-6">
          Pomożemy Ci w planowaniu kolejnej podrózy.
        </Text>
        <TouchableOpacity 
          className="bg-[#FF385C] py-3.5 px-6 rounded-lg items-center"
          onPress={handleLogin}
        >
          <Text className="text-white text-base font-semibold">
            Zaloguj się
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TripsPage;
