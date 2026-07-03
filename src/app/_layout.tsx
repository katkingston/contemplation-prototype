import {
  Archivo_600SemiBold,
  Archivo_700Bold,
} from '@expo-google-fonts/archivo';
import {
  CourierPrime_400Regular,
  CourierPrime_700Bold,
  useFonts,
} from '@expo-google-fonts/courier-prime';
import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { ServicesProvider } from '@/services/provider';
import { color } from '@/theme/tokens';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CourierPrime_400Regular,
    CourierPrime_700Bold,
    Archivo_600SemiBold,
    Archivo_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: color.paper }} />;
  }

  return (
    <ServicesProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.paper } }} />
    </ServicesProvider>
  );
}
