/** Mental Health Resources — full page (linked from Journey and Crisis). */
import { router } from 'expo-router';
import React from 'react';
import { ResourcesList } from '@/components/CrisisButton';
import { AppText, Button, Gap, Screen } from '@/components/ui';

export default function Resources() {
  return (
    <Screen fade={false} testID="resources-screen">
      <Gap size="xl" />
      <AppText variant="title">Mental Health Resources</AppText>
      <Gap size="md" />
      <ResourcesList />
      <Gap size="xl" />
      <Button
        label="Back"
        kind="ghost"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/journey'))}
      />
      <Gap size="lg" />
    </Screen>
  );
}
