/** O2 — Before You Begin: disclaimer, age gate, resources pop-up. GATE. */
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { ResourcesList } from '@/components/CrisisButton';
import { AppText, Button, Screen, Sheet, Spacer, useAnchor, Wordmark } from '@/components/ui';
import { disclaimer } from '@/content/copy';
import { useApp } from '@/services/provider';
import { anchor, space } from '@/theme/tokens';

export default function Disclaimer() {
  const { act } = useApp();
  const ax = useAnchor();
  const [showResources, setShowResources] = useState(false);

  const onContinue = async () => {
    if (await act((s) => s.acceptDisclaimer())) router.replace('/get-ready-free');
  };

  // Jul 30 designs: wordmark top, body paragraphs, bold age/notice line,
  // primary "I Understand · Continue →", outlined Mental Health Resources.
  const paragraphs = disclaimer.paragraphs.slice(0, -1);
  const boldNote = disclaimer.paragraphs[disclaimer.paragraphs.length - 1];

  // The approved copy must never be cut or covered (App-CLAUDE.md), and it is
  // longer than any phone viewport can pin — so this screen FLOWS and scrolls
  // when it must (Kat, Aug 19). On tall screens the spacer still sets the
  // buttons low, close to the O1 composition.
  return (
    <Screen testID="disclaimer-screen" top={anchor.wordmark}>
      <Wordmark />
      <View style={{ height: ax(anchor.intro) - ax(anchor.wordmark) - 25 }} />
      {paragraphs.map((p, i) => (
        <AppText key={i} variant="body" style={{ marginBottom: space.md }}>
          {p}
        </AppText>
      ))}
      <AppText variant="bodyBold">{boldNote}</AppText>
      <Spacer />
      <View style={{ height: space.xl }} />
      <Button label={disclaimer.continueButton} arrow onPress={onContinue} testID="disclaimer-continue" />
      <View style={{ height: 21 }} />
      <Button
        label={disclaimer.resourcesButton}
        kind="secondary"
        onPress={() => setShowResources(true)}
        testID="resources-button"
      />
      <Sheet
        visible={showResources}
        onClose={() => setShowResources(false)}
        title="Mental Health Resources">
        <ResourcesList />
      </Sheet>
    </Screen>
  );
}
