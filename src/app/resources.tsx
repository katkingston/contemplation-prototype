/**
 * Mental Health Resources — full page (linked from Account, Crisis, and the
 * disclaimer). Jul 30 designs: dark surface, mono intro, hairline resource
 * rows, outlined Back. No fade — help must appear instantly.
 */
import { router } from 'expo-router';
import React from 'react';
import { ResourcesList } from '@/components/CrisisButton';
import { Button, Gap, Screen, Spacer } from '@/components/ui';
import { anchor } from '@/theme/tokens';

export default function Resources() {
  // X2: mono intro on the 180 line, rows below it, outlined Back on the last.
  return (
    <Screen dark fade={false} testID="resources-screen" top={anchor.intro}>
      <ResourcesList dark />
      <Spacer />
      <Gap size="xl" />
      <Button
        label="Back"
        kind="secondary"
        dark
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/account'))}
      />
      <Gap size="xl" />
    </Screen>
  );
}
