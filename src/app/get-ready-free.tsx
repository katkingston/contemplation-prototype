/** O3 — Get Ready to Contemplate (free taste). Same setup as C3. */
import { router } from 'expo-router';
import React from 'react';
import { GetReadyScreen } from '@/components/GetReady';

export default function GetReadyFree() {
  return (
    <GetReadyScreen
      testID="get-ready-free"
      onBegin={(minutes, music) =>
        router.push({ pathname: '/free-contemplation', params: { minutes: String(minutes), music: music ? '1' : '0' } })
      }
    />
  );
}
