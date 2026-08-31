/**
 * O9 — Choose your time (onboarding): when should each day's contemplation
 * arrive? Defaults to 6:00 PM; changeable later in Settings.
 * Jul 30 designs: wordmark header, bold headline, body, time field + Set.
 */
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { DropTimeInput } from '@/components/DropTimeInput';
import {
  Anchored,
  AnchoredBottom,
  AppText,
  Button,
  Stage,
  Wordmark,
} from '@/components/ui';
import { anchor, anchorBottom } from '@/theme/tokens';

export default function DropTime() {
  // O9: wordmark 72, headline 247 (20/120%), body 349, time field 448, CTA
  // on the bottom line.
  return (
    <Stage testID="drop-time-screen">
      <Anchored y={anchor.wordmark}>
        <Wordmark />
      </Anchored>
      <Anchored y={247}>
        <AppText variant="heading">Each day’s new contemplation arrives at this time.</AppText>
      </Anchored>
      {/* The input FLOWS below the copy with a fixed gap (Kat, Aug 19) — an
          independently-anchored input crowded the paragraph whenever the copy
          wrapped one line further on a narrower phone. */}
      <Anchored y={349}>
        <AppText variant="body" muted>
          Evening tends to suit the practice, a moment to look back at the day, but
          choose what fits your life. You can change this anytime in Settings.
        </AppText>
        <View style={{ height: 28 }} />
        <DropTimeInput />
      </Anchored>
      <AnchoredBottom up={anchorBottom.action}>
        <Button label="Continue" arrow onPress={() => router.replace('/home')} testID="drop-time-continue" />
      </AnchoredBottom>
    </Stage>
  );
}
