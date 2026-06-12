/** O7 — Baseline Intro: frame the intake as a baseline to reflect on later. */
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { AppText, Button, Gap, Screen } from '@/components/ui';
import { baselineIntro } from '@/content/copy';
import { color, radius } from '@/theme/tokens';

export default function BaselineIntro() {
  return (
    <Screen scroll={false} style={{ justifyContent: 'center' }} testID="baseline-intro">
      <View
        style={{
          height: 140,
          borderRadius: radius.lg,
          backgroundColor: color.faint,
          borderWidth: 1,
          borderColor: color.line,
          marginBottom: 24,
        }}
      />
      <AppText variant="title" center>
        {baselineIntro.title}
      </AppText>
      <Gap size="md" />
      <AppText variant="body" muted center>
        {baselineIntro.body}
      </AppText>
      <Gap size="xl" />
      <Button label="Begin" onPress={() => router.push('/intake')} testID="baseline-begin" />
    </Screen>
  );
}
