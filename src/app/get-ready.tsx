/** C3 — Get Ready to Contemplate (daily loop). */
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { GetReadyScreen } from '@/components/GetReady';

export default function GetReady() {
  const params = useLocalSearchParams<{ seriesId?: string; index?: string }>();
  return (
    <GetReadyScreen
      testID="get-ready"
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
