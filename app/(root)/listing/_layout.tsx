import { Stack } from 'expo-router';

export default function ListingLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: 'white'
        }
      }}
    />
  );
}
