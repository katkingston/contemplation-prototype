/** O1 — Splash / Loading. Routes first-run vs returning. */
import { router, useRootNavigationState } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AppText, Button, Gap, Screen } from '@/components/ui';
import { splashTagline } from '@/content/copy';
import { seriesLength } from '@/content/series';
import {
  activeSeries,
  hasActiveAccess,
  isDropAvailable,
  isSeriesAtWrap,
  progressFor,
} from '@/services/logic';
import { useApp } from '@/services/provider';
import { APP_NAME, color, radius, space } from '@/theme/tokens';

export default function Splash() {
  const { hydrated, hydrationFailed, data, retryHydration } = useApp();
  const navState = useRootNavigationState();

  useEffect(() => {
    if (!hydrated || hydrationFailed || !navState?.key) return;
    const t = setTimeout(() => {
      if (data.onboardingStep === 'done' && data.profile) {
        // Returning users land on the pre-contemplation page for immediate
        // engagement — if today's contemplation is available. Otherwise Home.
        const series = activeSeries(data);
        const p = progressFor(data, series.id);
        const ready =
          !isSeriesAtWrap(data, series) &&
          p.currentIndex < seriesLength(series) &&
          hasActiveAccess(data, series.id) &&
          isDropAvailable(data, series.id);
        if (!ready) {
          router.replace('/home');
        } else if (p.currentIndex === 0) {
          // First contemplation of a series must pass through its introduction.
          router.replace({ pathname: '/series-intro', params: { seriesId: series.id } });
        } else {
          router.replace({
            pathname: '/get-ready',
            params: { seriesId: series.id, index: String(p.currentIndex) },
          });
        }
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
  }, [hydrated, hydrationFailed, navState?.key, data]);

  if (hydrated && hydrationFailed) {
    return (
      <Screen scroll={false} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <AppText variant="title" center>
          Couldn’t load your data
        </AppText>
        <Gap size="sm" />
        <AppText variant="body" muted center style={{ maxWidth: 300 }}>
          Check your connection and try again. Nothing has been lost.
        </AppText>
        <Gap size="lg" />
        <Button label="Try again" arrow onPress={() => void retryHydration()} testID="retry-hydration" />
      </Screen>
    );
  }

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
