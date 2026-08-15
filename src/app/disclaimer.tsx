/** O2 — Before You Begin: disclaimer, age gate, resources pop-up. GATE. */
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { ResourcesList } from '@/components/CrisisButton';
import {
  Anchored,
  AnchoredBottom,
  AppText,
  Button,
  Sheet,
  Stage,
  Wordmark,
} from '@/components/ui';
import { disclaimer } from '@/content/copy';
import { useApp } from '@/services/provider';
import { anchor, space } from '@/theme/tokens';

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

  // O1: wordmark 72, body block 400, bold notice 597, then the two stacked
  // full-width buttons on 661 and 731.
  return (
    <Stage testID="disclaimer-screen">
      <Anchored y={anchor.wordmark}>
        <Wordmark />
      </Anchored>
      {/* O1 draws this block at 400, but its placeholder is about half the
          length of the approved disclaimer copy — which must not be cut
          (App-CLAUDE.md). Starting on the 180 line keeps the real copy whole
          and clear of the two pinned buttons. */}
      <Anchored y={anchor.intro}>
        {paragraphs.map((p, i) => (
          <AppText key={i} variant="body" style={{ marginBottom: space.md }}>
            {p}
          </AppText>
        ))}
        <AppText variant="bodyBold">{boldNote}</AppText>
      </Anchored>
      <AnchoredBottom up={64}>
        <Button label={disclaimer.continueButton} arrow onPress={onContinue} testID="disclaimer-continue" />
        <View style={{ height: 21 }} />
        <Button
          label={disclaimer.resourcesButton}
          kind="secondary"
          onPress={() => setShowResources(true)}
          testID="resources-button"
        />
      </AnchoredBottom>
      <Sheet
        visible={showResources}
        onClose={() => setShowResources(false)}
        title="Mental Health Resources">
        <ResourcesList />
      </Sheet>
    </Stage>
  );
}
