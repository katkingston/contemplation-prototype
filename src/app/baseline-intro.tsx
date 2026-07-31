/** O7 — Baseline Intro: frame the intake as a baseline to reflect on later. */
import { router } from 'expo-router';
import React from 'react';
import { AppText, Button, Gap, Screen, Spacer, Wordmark } from '@/components/ui';
import { baselineIntro } from '@/content/copy';

export default function BaselineIntro() {
  // Jul 30 designs: wordmark top, lowercase-style title, mono body, full-width CTA.
  return (
    <Screen testID="baseline-intro">
      <Gap size="lg" />
      <Wordmark />
      <Gap size="xxl" />
      <Gap size="xl" />
      <AppText variant="titleLower">{baselineIntro.title}</AppText>
      <Gap size="md" />
      <AppText variant="monoBody" muted>
        {baselineIntro.body}
      </AppText>
      <Spacer />
      <Button label="Begin" arrow onPress={() => router.push('/intake')} testID="baseline-begin" />
      <Gap size="lg" />
    </Screen>
  );
}
