/** O4 — Opening Free Contemplation: one ungated taste, then on to benefits. */
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ContemplationPlayer } from '@/components/Player';
import { FREE_CONTEMPLATION } from '@/content/series';
import { useApp } from '@/services/provider';

export default function FreeContemplation() {
  const { act } = useApp();
  const params = useLocalSearchParams<{ minutes?: string; music?: string }>();
  const minutes = Number(params.minutes ?? '1') || 1;

  const finish = async () => {
    // Navigate regardless — losing the step checkpoint must not trap the user
    // on a finished contemplation. The checkpoint retries on next action.
    await act((s) => s.setOnboardingStep('paywall'));
    router.replace('/paywall');
  };

  return (
    <ContemplationPlayer
      prompt={FREE_CONTEMPLATION.prompt}
      gradient={FREE_CONTEMPLATION.gradient}
      videoUri={FREE_CONTEMPLATION.videoUri}
      minutes={minutes}
      musicOn={(params.music ?? '1') === '1'}
      onFinish={finish}
    />
  );
}
