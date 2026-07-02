/** M1 — Menu (G4): Account, Settings, Subscription, Resources. */
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ResourcesList } from '@/components/CrisisButton';
import { AppText, Button, Gap, ListRow, Screen, Sheet } from '@/components/ui';



export default function Menu() {

  const [showResources, setShowResources] = useState(false);


  return (
    <Screen testID="menu-screen">
      <Gap size="xl" />
      <AppText variant="title">Menu</AppText>
      <Gap size="md" />
      <ListRow label="Account" onPress={() => router.push('/account')} testID="menu-account" />
      <ListRow label="Settings" onPress={() => router.push('/settings')} testID="menu-settings" />
      <ListRow label="Subscription" onPress={() => router.push('/subscription')} testID="menu-subscription" />
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
