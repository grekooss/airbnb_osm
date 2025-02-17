import { Stack } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

const BookingModal = () => {
  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          title: 'Booking',
        }}
      />
      <View className="flex-1 items-center justify-center">
        <Text className="font-cereal-bold text-xl">BookingModal</Text>
      </View>
    </View>
  );
};

export default BookingModal;
