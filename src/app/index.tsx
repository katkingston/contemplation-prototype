/** O1 — Splash / Loading. Routes first-run vs returning. */
import { router, useRootNavigationState } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AppText, Gap, Screen } from '@/components/ui';
import { splashTagline } from '@/content/copy';
import { useApp } from '@/services/provider';
import { APP_NAME, color, radius, space } from '@/theme/tokens';

export default function Splash() {
  const { hydrated, data } = useApp();
  const navState = useRootNavigationState();

  useEffect(() => {
    if (!hydrated || !navState?.key) return;
    const t = setTimeout(() => {
      if (data.onboardingStep === 'done' && data.profile) {
        router.replace('/home');
      } else if (data.disclaimerAcceptedAt == null) {
        router.replace('/disclaimer');
      } else {
        // Resume onboarding where it left off.
        const step = data.onboardingStep;
        const route =
          step === 'free'
            ? '/get-ready-free'
            : step === 'paywall'
              ? '/paywall'
              : step === 'login'
                ? '/login'
                : step === 'intake'
                  ? '/baseline-intro'
                  : '/disclaimer';
        router.replace(route);
      }
    }, 900); // brief brand moment
    return () => clearTimeout(t);
  }, [hydrated, navState?.key, data]);

  return (
    <Screen scroll={false} style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: radius.lg,
          backgroundColor: color.line,
          marginBottom: space.md,
        }}
      />
      <AppText variant="title">{APP_NAME}</AppText>
      <Gap size="sm" />
      <AppText variant="small" muted center style={{ maxWidth: 280, fontStyle: 'italic' }}>
        {splashTagline}
      </AppText>
      <Gap size="lg" />
      <ActivityIndicator color={color.muted} />
    </Screen>
  );
}
