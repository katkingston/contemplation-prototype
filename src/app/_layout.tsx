import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ServicesProvider } from '@/services/provider';

export default function RootLayout() {
  return (
    <ServicesProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </ServicesProvider>
  );
}
