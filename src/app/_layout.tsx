import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, View } from 'react-native';
import { ServicesProvider, useApp } from '@/services/provider';
import { color, space, type } from '@/theme/tokens';

/** Global error surface — no failure is ever a silent blank screen. */
function ErrorBanner() {
  const { error, clearError } = useApp();
  if (!error) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Dismiss error"
      onPress={clearError}
      style={{
        position: 'absolute',
        left: space.md,
        right: space.md,
        bottom: space.xl,
        backgroundColor: color.danger,
        borderRadius: 5,
        padding: space.md,
        zIndex: 1000,
        elevation: 6,
      }}>
      <Text style={{ ...type.small, color: color.paper }}>{error}</Text>
      <Text style={{ ...type.caption, color: color.paper, opacity: 0.8, marginTop: 4 }}>
        Tap to dismiss
      </Text>
    </Pressable>
  );
}

export default function RootLayout() {
  // Brand fonts (all SIL OFL): BIZ UD Mincho (body voice), Karrik (display),
  // Miedinger (caps labels / alternative sans).
  const [fontsLoaded] = useFonts({
    'BIZUDMincho-Regular': require('../../assets/fonts/BIZUDMincho-Regular.ttf'),
    'BIZUDMincho-Bold': require('../../assets/fonts/BIZUDMincho-Bold.ttf'),
    'Karrik-Regular': require('../../assets/fonts/Karrik-Regular.otf'),
    'Karrik-Italic': require('../../assets/fonts/Karrik-Italic.otf'),
    'Miedinger-Book': require('../../assets/fonts/Miedinger-Book.otf'),
    'Daniel-Regular': require('../../assets/fonts/Daniel-Regular.ttf'),
    'Miedinger-Bold': require('../../assets/fonts/Miedinger-Bold.otf'),
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: color.paper }} />;
  }

  return (
    <ServicesProvider>
      <StatusBar style="auto" />
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.paper } }}
        />
        <ErrorBanner />
      </View>
    </ServicesProvider>
  );
}
