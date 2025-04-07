import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { loginGoogle } from '@/lib/appwrite';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/Button';

const LoginModal = () => {
  useWarmUpBrowser();
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

const handleLogin = async () => {
  try {
    const success = await loginGoogle();
    if (success) {
      console.log('Login successful');
    } else {
      Alert.alert('Error','Login failed');
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Login failed');
  }
};

  return (
    <Animated.View 
      className="flex-1 bg-white"
    >
      <SafeAreaView className="flex-1">
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View className="flex-1 px-6">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity 
              onPress={handleClose}
              className="p-2 -ml-2"
            >
              <Ionicons name="close-outline" size={28} />
            </TouchableOpacity>
            <Text className="text-2xl font-semibold flex-1 ml-2">
              Zaloguj się lub zarejestruj
            </Text>
          </View>
          <TextInput
            autoCapitalize="none"
            placeholder="Email"
            className="mb-4 h-12 rounded-lg border border-gray-300 bg-white px-4"
          />
          <TextInput
            autoCapitalize="none"
            placeholder="Password"
            className="mb-4 h-12 rounded-lg border border-gray-300 bg-white px-4"
          />
          <Button label="Continue" />

          <View className="my-4 flex-row items-center">
            <View className="h-[1px] flex-1 bg-gray-300" />
            <Text className="mx-4 text-gray-500">or</Text>
            <View className="h-[1px] flex-1 bg-gray-300" />
          </View>

          <Button 
            variant="outline" 
            label="Continue with Apple"
            icon="logo-apple"
          />
          <Button
            onPress={handleLogin}
            variant="outline" 
            label="Continue with Google"
            icon="logo-google"
          />
          <Button 
            variant="outline" 
            label="Continue with Facebook"
            icon="logo-facebook"
          />
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

export default LoginModal;
