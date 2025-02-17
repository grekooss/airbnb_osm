import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleStyle: {
          fontFamily: 'Cereal-Medium',
        },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} className="ml-4">
            <Ionicons name="close-outline" size={24} color="black" />
          </TouchableOpacity>
        ),
      }}
    />
  );
}
