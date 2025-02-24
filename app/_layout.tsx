import '@/global.css';
import { SplashScreen, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CategoryProvider } from '@/context/CategoryContext';

export {
  // Catch any errors thrown by the layout.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(root)/(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Cereal-Black': require('@/assets/fonts/airbnb-cereal-app-black.ttf'),
    'Cereal-Bold': require('@/assets/fonts/airbnb-cereal-app-bold.ttf'),
    'Cereal-Book': require('@/assets/fonts/airbnb-cereal-app-book.ttf'),
    'Cereal-Extrabold': require('@/assets/fonts/airbnb-cereal-app-extrabold.ttf'),
    'Cereal-Light': require('@/assets/fonts/airbnb-cereal-app-light.ttf'),
    'Cereal-Medium': require('@/assets/fonts/airbnb-cereal-app-medium.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CategoryProvider>
        <RootLayoutNav />
      </CategoryProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Domyślnie wyłączamy nagłówek dla wszystkich ekranów
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="(root)" />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
