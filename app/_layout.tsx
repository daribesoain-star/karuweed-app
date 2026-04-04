import React, { useEffect } from 'react';
import { Slot, Redirect, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../src/store/authStore';

export default function RootLayout() {
  const { user, isLoading, fetchUser } = useAuthStore();
  const segments = useSegments();

  useEffect(() => {
    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" backgroundColor="#0A0A0A" />
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  const inAuthGroup = segments[0] === '(auth)';

  if (!user && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <>
      <StatusBar style="light" backgroundColor="#0A0A0A" />
      <Slot />
    </>
  );
}
