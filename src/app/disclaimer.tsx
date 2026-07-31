/** O2 — Before You Begin: disclaimer, age gate, resources pop-up. GATE. */
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ResourcesList } from '@/components/CrisisButton';
import { AppText, Button, Gap, Screen, Sheet, Spacer, Wordmark } from '@/components/ui';
import { disclaimer } from '@/content/copy';
import { useApp } from '@/services/provider';

export default function Disclaimer() {
  const { act } = useApp();
  const [showResources, setShowResources] = useState(false);

  const onContinue = async () => {
    if (await act((s) => s.acceptDisclaimer())) router.replace('/get-ready-free');
  };

  // Jul 30 designs: wordmark top, body paragraphs, bold age/notice line,
  // primary "I Understand · Continue →", outlined Mental Health Resources.
  const paragraphs = disclaimer.paragraphs.slice(0, -1);
  const boldNote = disclaimer.paragraphs[disclaimer.paragraphs.length - 1];

  return (
    <Screen testID="disclaimer-screen">
      <Gap size="lg" />
      <Wordmark />
      <Spacer />
      <Gap size="xl" />
      {paragraphs.map((p, i) => (
        <React.Fragment key={i}>
          <AppText variant="body">{p}</AppText>
          <Gap size="md" />
        </React.Fragment>
      ))}
      <AppText variant="bodyBold">{boldNote}</AppText>
      <Gap size="lg" />
      <Button label={disclaimer.continueButton} arrow onPress={onContinue} testID="disclaimer-continue" />
      <Gap size="sm" />
      <Button
        label={disclaimer.resourcesButton}
        kind="secondary"
        onPress={() => setShowResources(true)}
        testID="resources-button"
      />
      <Gap size="lg" />
      <Sheet
        visible={showResources}
        onClose={() => setShowResources(false)}
        title="Mental Health Resources">
        <ResourcesList />
      </Sheet>
    </Screen>
  );
}
