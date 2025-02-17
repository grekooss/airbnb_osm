import { Stack } from 'expo-router';
import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import Button from '../../../components/Button';

const LoginModal = () => {
  useWarmUpBrowser();
  return (
    <View className="flex-1 bg-white p-6">
      <Stack.Screen
        options={{
          title: 'Login or sign up',
        }}
      />
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
        label="Continue with Phone"
        icon="call-outline"
      />
      <Button 
        variant="outline" 
        label="Continue with Apple"
        icon="logo-apple"
      />
      <Button 
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
  );
};

export default LoginModal;
