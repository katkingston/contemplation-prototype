/**
 * Get Ready to Contemplate — precedes EVERY contemplation (free taste included).
 * Two versions (per Kat, July 2026):
 *  - App-open (start of a session): shows series context so the user knows
 *    what they are starting (tag, title, number, hint, progress dashes).
 *  - In-flow (reached from Home/series): minimal, context already seen.
 * Main focus: choose time + music. Instructions behind a pop-up. No crisis
 * button here (it remains on the contemplation player and journal).
 * The Begin tap IS the required timer confirmation (default 1 min).
 */
import { Asset } from 'expo-asset';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { PLACEHOLDER_VIDEO } from '@/components/Player';
import { SeriesDashes } from '@/components/SeriesDashes';
import { AppText, Button, Eyebrow, Gap, Row, Screen, Select, Sheet, Spacer } from '@/components/ui';
import { instructions } from '@/content/copy';
import { useApp } from '@/services/provider';
import { space, timing } from '@/theme/tokens';

export function InstructionsContent() {
  return (
    <View>
      <AppText variant="body" style={{ marginBottom: space.md }}>
        {instructions.intro}
      </AppText>
      {instructions.steps.map((s, i) => (
        <AppText key={i} variant="body" style={{ marginBottom: space.sm }}>
          {i + 1}. {s}
        </AppText>
      ))}
      <AppText variant="body" style={{ marginTop: space.sm }}>
        {instructions.outro}
      </AppText>
    </View>
  );
}

export interface GetReadySeriesContext {
  tag: string;
  title: string;
  number: number;
  hint: string;
  done: number;
  total: number;
}

export function GetReadyScreen({
  onBegin,
  seriesContext,
  testID,
}: {
  onBegin: (minutes: number, musicOn: boolean) => void;
  /** App-open version: series info so the user knows what they're starting. */
  seriesContext?: GetReadySeriesContext;
  testID?: string;
}) {
  const { data } = useApp();
  const [minutes, setMinutes] = useState<number>(
    timing.timerChoicesMin.includes(data.settings.timerDefaultMin)
      ? data.settings.timerDefaultMin
      : timing.defaultTimerMin,
  );
  const [musicOn, setMusicOn] = useState<boolean>(data.settings.musicDefaultOn);
  const [showInstructions, setShowInstructions] = useState(false);

  // Pre-warm the contemplation footage while the user chooses their time so
  // the player opens without a loading lag (browser/OS cache does the rest).
  useEffect(() => {
    Asset.fromModule(PLACEHOLDER_VIDEO as number)
      .downloadAsync()
      .catch(() => {}); // prefetch is best-effort, never block the flow
  }, []);

  return (
    <Screen scroll={false} testID={testID}>
      <Gap size="sm" />
      <Row between>
        <Button
          label="✕ Exit"
          kind="ghost"
          small
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
          testID="get-ready-exit"
        />
      </Row>
      <Gap size="xl" />
      <AppText variant="title">Get ready to contemplate</AppText>
      {seriesContext ? (
        <>
          <Gap size="md" />
          <AppText variant="label" muted>
            {seriesContext.tag} · {seriesContext.title}
          </AppText>
          <Gap size="xs" />
          <AppText variant="bodyBold">
            No. {seriesContext.number} · {seriesContext.hint}
          </AppText>
          <Gap size="sm" />
          <SeriesDashes total={seriesContext.total} done={seriesContext.done} active />
        </>
      ) : null}
      <Eyebrow>Time</Eyebrow>
      <Select
        label="Time"
        options={timing.timerChoicesMin}
        value={minutes}
        onChange={setMinutes}
        labels={(m) => `${m} minute${m === 1 ? '' : 's'}`}
        testID="select-time"
      />
      <Eyebrow>Music</Eyebrow>
      <Select
        label="Music"
        options={['Music on', 'Music off'] as const}
        value={musicOn ? 'Music on' : 'Music off'}
        onChange={(v) => setMusicOn(v === 'Music on')}
        testID="select-music"
      />
      <Spacer />
      <Button
        label="Instructions ?"
        kind="ghost"
        small
        onPress={() => setShowInstructions(true)}
        testID="instructions-button"
      />
      <Gap size="md" />
      <Button label="Begin" arrow onPress={() => onBegin(minutes, musicOn)} testID="begin-button" />
      <Gap size="sm" />
      <Button
        label="Go to homepage"
        kind="ghost"
        small
        onPress={() => router.replace('/home')}
        testID="go-home"
      />
      <Gap size="lg" />
      <Sheet
        visible={showInstructions}
        onClose={() => setShowInstructions(false)}
        title={instructions.title}>
        <InstructionsContent />
      </Sheet>
    </Screen>
  );
}
