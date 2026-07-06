import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { NoticeHost } from '@/components/Notice';
import { ServicesProvider } from '@/services/provider';
import { color } from '@/theme/tokens';

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
        <NoticeHost />
      </View>
    </ServicesProvider>
  );
}
