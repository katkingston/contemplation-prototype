/** O2 — Before You Begin: disclaimer, age gate, resources pop-up. GATE. */
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ResourcesList } from '@/components/CrisisButton';
import { AppText, Button, Gap, Screen, Sheet } from '@/components/ui';
import { disclaimer } from '@/content/copy';
import { useApp } from '@/services/provider';

export default function Disclaimer() {
  const { act } = useApp();
  const [showResources, setShowResources] = useState(false);

  const onContinue = async () => {
    await act((s) => s.acceptDisclaimer());
    router.replace('/get-ready-free');
  };

  return (
    <Screen testID="disclaimer-screen">
      <Gap size="xl" />
      <AppText variant="title">{disclaimer.title}</AppText>
      <AppText variant="body" muted>
        {disclaimer.subtitle}
      </AppText>
      <Gap size="lg" />
      {disclaimer.paragraphs.map((p, i) => (
        <React.Fragment key={i}>
          <AppText variant="body">{p}</AppText>
          <Gap size="md" />
        </React.Fragment>
      ))}
      <Gap size="sm" />
      <Button
        label={disclaimer.resourcesButton}
        kind="secondary"
        onPress={() => setShowResources(true)}
        testID="resources-button"
      />
      <Gap size="md" />
      <Button label={disclaimer.continueButton} onPress={onContinue} testID="disclaimer-continue" />
      <Sheet
        visible={showResources}
        onClose={() => setShowResources(false)}
        title="Mental Health Resources">
        <ResourcesList />
      </Sheet>
    </Screen>
  );
}
