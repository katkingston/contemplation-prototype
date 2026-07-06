/**
 * O9 — Choose your time (onboarding): when should each day's contemplation
 * arrive? Defaults to 6:00 PM; changeable later in Settings.
 */
import { router } from 'expo-router';
import React from 'react';
import { DropTimeInput } from '@/components/DropTimeInput';
import { AppText, Button, Gap, Screen, Spacer } from '@/components/ui';

export default function DropTime() {
  return (
    <Screen scroll={false} testID="drop-time-screen">
      <Gap size="xxl" />
      <AppText variant="title">When should your contemplation arrive?</AppText>
      <Gap size="md" />
      <AppText variant="body" muted>
        One contemplation arrives each day. Evening tends to suit the practice, a
        moment to look back at the day, but choose what fits your life. You can
        change this anytime in Settings.
      </AppText>
      <Gap size="lg" />
      <DropTimeInput />
      <Spacer />
      <Button label="Continue" arrow onPress={() => router.replace('/home')} testID="drop-time-continue" />
      <Gap size="lg" />
    </Screen>
  );
}
