/**
 * Get Ready to Contemplate — precedes EVERY contemplation (free taste included).
 * Main focus: choose time + music. Secondary, small: Crisis (top-right) and
 * Instructions hidden behind a button → pop-up.
 * The Begin tap IS the required timer confirmation (default 1 min).
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import { CrisisButton } from '@/components/CrisisButton';
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

export function GetReadyScreen({
  onBegin,
  testID,
}: {
  onBegin: (minutes: number, musicOn: boolean) => void;
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
        <View />
        <CrisisButton />
      </Row>
      <Gap size="xl" />
      <AppText variant="title">Get ready to contemplate</AppText>
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
