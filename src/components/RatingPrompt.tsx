/**
 * RatingPrompt — asks for an App Store rating at a warm moment (day exit).
 * ALL timing logic is tunable in tokens.ts `review`:
 *   minCompletions — never ask before this many contemplations
 *   cooldownDays   — wait at least this long between asks
 *   maxAsks        — stop asking after this many declines
 * State persists in settings (reviewAsks / reviewLastAt / reviewDone).
 * Native build: replace the mock action with expo-store-review
 * requestReview() — Apple then applies its own frequency caps on top.
 */
import React, { useEffect, useState } from 'react';
import { notify } from '@/components/Notice';
import { AppText, Button, Gap, Sheet } from '@/components/ui';
import { useApp } from '@/services/provider';
import { APP_NAME, review } from '@/theme/tokens';

export function RatingPrompt() {
  const { data, act } = useApp();
  const [visible, setVisible] = useState(false);
  const s = data.settings;

  useEffect(() => {
    const completions = data.sessions.length;
    const daysSinceLast = s.reviewLastAt
      ? (Date.now() - new Date(s.reviewLastAt).getTime()) / 86400_000
      : Infinity;
    const eligible =
      !s.reviewDone &&
      s.reviewAsks < review.maxAsks &&
      completions >= review.minCompletions &&
      daysSinceLast >= review.cooldownDays;
    if (!eligible) return;
    const t = setTimeout(() => setVisible(true), 1600); // let the screen land first
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const later = () => {
    setVisible(false);
    void act((svc) =>
      svc.saveSettings({ reviewAsks: s.reviewAsks + 1, reviewLastAt: new Date().toISOString() }),
    );
  };

  const rate = () => {
    setVisible(false);
    void act((svc) => svc.saveSettings({ reviewDone: true }));
    // TODO(Phase D): StoreReview.requestReview() in the native build.
    notify('Thank you. The App Store rating sheet opens in the native app.', 'success');
  };

  return (
    <Sheet visible={visible} onClose={later} title={`Enjoying ${APP_NAME}?`}>
      <AppText variant="body">
        A rating helps this practice reach people who need it. It takes one tap and
        never interrupts a contemplation.
      </AppText>
      <Gap size="lg" />
      <Button label={`Rate ${APP_NAME}`} onPress={rate} testID="rate-now" />
      <Gap size="sm" />
      <Button label="Not now" kind="ghost" onPress={later} testID="rate-later" />
    </Sheet>
  );
}
