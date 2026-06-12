/** M1 — Menu (G4): Account, Settings, Subscription, Series Intro replay, Resources. */
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ResourcesList } from '@/components/CrisisButton';
import { AppText, Button, Gap, ListRow, Screen, Sheet } from '@/components/ui';
import { activeSeries } from '@/services/logic';
import { useApp } from '@/services/provider';

export default function Menu() {
  const { data } = useApp();
  const [showResources, setShowResources] = useState(false);
  const series = activeSeries(data);

  return (
    <Screen testID="menu-screen">
      <Gap size="xl" />
      <AppText variant="title">Menu</AppText>
      <Gap size="md" />
      <ListRow label="Account" onPress={() => router.push('/account')} testID="menu-account" />
      <ListRow label="Settings" onPress={() => router.push('/settings')} testID="menu-settings" />
      <ListRow label="Subscription" onPress={() => router.push('/subscription')} testID="menu-subscription" />
      <ListRow
        label="Series Intro"
        sub="replay the introduction"
        onPress={() =>
          router.push({ pathname: '/series-intro', params: { seriesId: series.id, replay: '1' } })
        }
      />
      <ListRow
        label="Mental Health Resources"
        sub="crisis and support links"
        onPress={() => setShowResources(true)}
        testID="menu-resources"
      />
      <Gap size="xl" />
      <Button label="Close" kind="ghost" onPress={() => router.back()} />
      <Sheet
        visible={showResources}
        onClose={() => setShowResources(false)}
        title="Mental Health Resources">
        <ResourcesList />
      </Sheet>
    </Screen>
  );
}
