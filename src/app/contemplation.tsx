/** C4 — Contemplation (daily practice). Uninterruptible; ends → Add Time / Journal. */
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ContemplationPlayer } from '@/components/Player';
import { getSeries } from '@/content/series';
import { questionFor } from '@/services/logic';
import { useApp } from '@/services/provider';

export default function Contemplation() {
  const { data } = useApp();
  const params = useLocalSearchParams<{
    seriesId?: string;
    index?: string;
    minutes?: string;
    music?: string;
    carrySeconds?: string;
  }>();
  const series = getSeries(params.seriesId ?? '');
  const index = Number(params.index ?? '0') || 0;
  const minutes = Number(params.minutes ?? '1') || 1;
  const carry = Number(params.carrySeconds ?? '0') || 0;

  if (!series || !series.contemplations[index]) {
    router.replace('/home');
    return null;
  }
  const c = series.contemplations[index];

  return (
    <ContemplationPlayer
      prompt={questionFor(data, series, index)}
      gradient={c.gradient}
      videoUri={c.videoUri}
      minutes={minutes}
      musicOn={(params.music ?? '1') === '1'}
      onFinish={(reason, seconds) => {
        const totalSeconds = String(carry + seconds);
        if (reason === 'end') {
          // Deliberate exit → straight to the journal, no Add Time detour.
          router.replace({
            pathname: '/journal',
            params: { seriesId: series.id, index: String(index), totalSeconds },
          });
        } else {
          // Timer ran out → offer to add time or move on.
          router.replace({
            pathname: '/add-time',
            params: {
              seriesId: series.id,
              index: String(index),
              music: params.music ?? '1',
              totalSeconds,
            },
          });
        }
      }}
    />
  );
}
