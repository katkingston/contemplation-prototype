import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { NoticeHost } from '@/components/Notice';
import { ServicesProvider } from '@/services/provider';
import { color } from '@/theme/tokens';

/**
 * Web guard: react-navigation keeps lower stack screens mounted; if a browser
 * mispaints during transitions, a stray <video> must never surface. Hide any
 * video inside a hidden/inert/offscreen layer, and clip all videos to their
 * containers (Safari ignores parent overflow clipping for video).
 */
function useWebVideoGuard() {
  React.useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.textContent = `
      [aria-hidden="true"] video, [inert] video { display: none !important; }
      video { width: 100% !important; height: 100% !important; object-fit: cover !important; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
}

export default function RootLayout() {
  useWebVideoGuard();
  // Brand fonts per the Figma DESIGN SYSTEM page (Jul 30): Inter (sans, OFL),
  // HAL Timezone Mono (TRIAL — Kat licenses before any public release), and
  // WT Garamono (caps labels + tiny dates; Necto Mono retired per Kat).
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
    'Inter-Bold': require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
    'HALTimezoneMono-Book': require('../../assets/fonts/HALTimezoneMono-Book.otf'),
    'HALTimezoneMono-Bold': require('../../assets/fonts/HALTimezoneMono-Bold.otf'),
    'WTGaramono-Regular': require('../../assets/fonts/WTGaramono-Regular.otf'),
    'WTGaramono-Italic': require('../../assets/fonts/WTGaramono-Italic.otf'),
    'Daniel-Regular': require('../../assets/fonts/Daniel-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: color.paper }} />;
  }

  return (
    <ServicesProvider>
      <StatusBar style="auto" />
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            // Native gets the stack fade; on web it lets the screen beneath
            // (and Home's video) show through during transitions.
            ...(Platform.OS !== 'web' ? { animation: 'fade' as const, animationDuration: 260 } : {}),
            contentStyle: { backgroundColor: color.paper },
          }}
        />
        <NoticeHost />
      </View>
    </ServicesProvider>
  );
}
