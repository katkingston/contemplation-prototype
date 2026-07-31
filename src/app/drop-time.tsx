/**
 * O9 — Choose your time (onboarding): when should each day's contemplation
 * arrive? Defaults to 6:00 PM; changeable later in Settings.
 * Jul 30 designs: wordmark header, bold headline, body, time field + Set.
 */
import { router } from 'expo-router';
import React from 'react';
import { DropTimeInput } from '@/components/DropTimeInput';
import { AppText, Button, Gap, Screen, Spacer, Wordmark } from '@/components/ui';

export default function DropTime() {
  return (
    <Screen scroll={false} testID="drop-time-screen">
      <Gap size="lg" />
      <Wordmark />
      <Gap size="xxl" />
      <Gap size="xl" />
      <AppText variant="titleLower">Each day’s new contemplation arrives at this time.</AppText>
      <Gap size="md" />
      <AppText variant="body" muted>
        Evening tends to suit the practice, a moment to look back at the day, but
        choose what fits your life. You can change this anytime in Settings.
      </AppText>
      <Gap size="lg" />
      <DropTimeInput />
      <Spacer />
      <Button label="Continue" arrow onPress={() => router.replace('/home')} testID="drop-time-continue" />
      <Gap size="lg" />
    </Screen>
  );
}
