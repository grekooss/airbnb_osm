import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF385C',
        tabBarInactiveTintColor: '#717171',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: 75,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Cereal-Light',
          fontSize: 10,
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Odkrywaj',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlists"
        options={{
          headerShown: false,
          tabBarLabel: 'Listy życzeń',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          headerShown: false,
          tabBarLabel: 'Podróże',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="airbnb" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          headerShown: false,
          tabBarLabel: 'Wiadomości',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbox-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarLabel: 'Zaloguj',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
