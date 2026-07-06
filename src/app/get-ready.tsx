/** C3 — Get Ready to Contemplate (daily loop). */
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { GetReadyScreen, GetReadySeriesContext } from '@/components/GetReady';
import { getSeries, seriesLength } from '@/content/series';

export default function GetReady() {
  const params = useLocalSearchParams<{ seriesId?: string; index?: string; entry?: string }>();
  // App-open version carries series context; the in-flow version stays minimal.
  let seriesContext: GetReadySeriesContext | undefined;
  if (params.entry === 'open') {
    const s = getSeries(params.seriesId ?? '');
    const i = Number(params.index ?? '0');
    const c = s?.contemplations[Math.min(i, s ? seriesLength(s) - 1 : 0)];
    if (s && c) {
      seriesContext = {
        tag: s.tag,
        title: s.title,
        number: i + 1,
        hint: c.hint,
        done: i,
        total: seriesLength(s),
      };
    }
  }
  return (
    <GetReadyScreen
      testID="get-ready"
      seriesContext={seriesContext}
      onBegin={(minutes, music) =>
        router.push({
          pathname: '/contemplation',
          params: {
            seriesId: params.seriesId ?? '',
            index: params.index ?? '0',
            minutes: String(minutes),
            music: music ? '1' : '0',
            carrySeconds: '0',
          },
        })
      }
    />
  );
}
