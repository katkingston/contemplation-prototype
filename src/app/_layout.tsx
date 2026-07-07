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
