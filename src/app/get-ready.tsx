/** C3 — Get Ready to Contemplate (daily loop). */
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { GetReadyScreen, GetReadySeriesContext } from '@/components/GetReady';
import { getSeries, seriesCode, seriesLength } from '@/content/series';
import { seriesPalettes } from '@/theme/tokens';

export default function GetReady() {
  const params = useLocalSearchParams<{
    seriesId?: string;
    index?: string;
    entry?: string;
    redo?: string;
  }>();
  // Jul 30 designs: the daily-loop Get Ready always carries series context
  // (mono header code + hint + progress dots); only the free taste is minimal.
  let seriesContext: GetReadySeriesContext | undefined;
  const s = getSeries(params.seriesId ?? '');
  if (s) {
    const i = Number(params.index ?? '0');
    const c = s.contemplations[Math.min(i, seriesLength(s) - 1)];
    if (c) {
      seriesContext = {
        tag: s.tag,
        title: s.title,
        number: i + 1,
        hint: c.hint,
        done: i,
        total: seriesLength(s),
        code: seriesCode(s, i),
        gradient: seriesPalettes[s.id],
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
            redo: params.redo ?? '0',
          },
        })
      }
    />
  );
}
