import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CorporaProvider } from '../src/context/CorporaContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CorporaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="company/[id]" options={{ animation: 'slide_from_right' }} />
        </Stack>
      </CorporaProvider>
    </SafeAreaProvider>
  );
}
