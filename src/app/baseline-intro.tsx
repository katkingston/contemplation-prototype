/** O7 — Baseline Intro: frame the intake as a baseline to reflect on later. */
import { router } from 'expo-router';
import React from 'react';
import {
  Anchored,
  AnchoredBottom,
  AppText,
  Button,
  Stage,
  Wordmark,
} from '@/components/ui';
import { baselineIntro } from '@/content/copy';
import { anchor, anchorBottom } from '@/theme/tokens';

export default function BaselineIntro() {
  // O7: wordmark 72, title 241, body 324, full-width CTA on the bottom line.
  return (
    <Stage testID="baseline-intro">
      <Anchored y={anchor.wordmark}>
        <Wordmark />
      </Anchored>
      <Anchored y={anchor.formTitle}>
        <AppText variant="titleLower">{baselineIntro.title}</AppText>
      </Anchored>
      <Anchored y={anchor.formBody}>
        <AppText variant="monoBody" muted>
          {baselineIntro.body}
        </AppText>
      </Anchored>
      <AnchoredBottom up={anchorBottom.action}>
        <Button label="Begin" arrow onPress={() => router.push('/intake')} testID="baseline-begin" />
      </AnchoredBottom>
    </Stage>
  );
}
