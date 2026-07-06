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
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { SeriesDashes } from '@/components/SeriesDashes';
import { AppText, Button, ChipGroup, Eyebrow, Gap, Row, Screen, Sheet, Spacer } from '@/components/ui';
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
      <Eyebrow>Choose your time</Eyebrow>
      <ChipGroup
        options={timing.timerChoicesMin}
        value={minutes}
        onChange={setMinutes}
        labels={(m) => `${m} min`}
      />
      <Eyebrow>Music</Eyebrow>
      <ChipGroup
        options={['Music on', 'Music off'] as const}
        value={musicOn ? 'Music on' : 'Music off'}
        onChange={(v) => setMusicOn(v === 'Music on')}
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
