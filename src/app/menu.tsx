/** M1 — Menu (G4): Settings, Subscription, Resources. */
import { router } from 'expo-router';
import React, { useState } from 'react';
import { TabScreen } from '@/components/BottomNav';
import { ResourcesList } from '@/components/CrisisButton';
import { AppText, Gap, ListRow, Sheet } from '@/components/ui';

export default function Menu() {
  const [showResources, setShowResources] = useState(false);

  return (
    <TabScreen active="menu">
      <Gap size="xl" />
      <AppText variant="title">Menu</AppText>
      <Gap size="md" />
      <ListRow label="Settings" onPress={() => router.push('/settings')} testID="menu-settings" />
      <ListRow label="Subscription" onPress={() => router.push('/subscription')} testID="menu-subscription" />
      <ListRow
        label="Mental Health Resources"
        sub="crisis and support links"
        onPress={() => setShowResources(true)}
        testID="menu-resources"
      />
      <Sheet
        visible={showResources}
        onClose={() => setShowResources(false)}
        title="Mental Health Resources">
        <ResourcesList />
      </Sheet>
    </TabScreen>
  );
}
