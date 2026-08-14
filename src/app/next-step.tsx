/**
 * S4 — Next Step: start the next series if one is available, or replay this
 * one with the same or alternate questions.
 */
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { AppText, Button, Gap, ListRow, Screen, Spacer } from '@/components/ui';
import { chapterNumber, getSeries, SERIES_ONE } from '@/content/series';
import { hasActiveAccess, nextSeriesAfter } from '@/services/logic';
import { useApp } from '@/services/provider';

export default function NextStep() {
  const { data, act } = useApp();
  const params = useLocalSearchParams<{ seriesId?: string }>();
  const seriesId = params.seriesId ?? '';
  const series = getSeries(seriesId);
  const next = nextSeriesAfter(seriesId);

  if (!series) {
    router.replace('/home');
    return null;
  }

  const startNext = () => {
    if (!next) return;
    if (!hasActiveAccess(data, next.id)) {
      router.push('/subscription');
      return;
    }
    router.replace({ pathname: '/series-intro', params: { seriesId: next.id } });
  };

  const replay = async (useAlt: boolean) => {
    if (await act((s) => s.startReplay(seriesId, useAlt)))
      router.replace({ pathname: '/series-intro', params: { seriesId } });
  };

  return (
    <Screen testID="next-step">
      <Gap size="xl" />
      <AppText variant="titleLower">What’s next?</AppText>
      <Gap size="sm" />
      <AppText variant="body" muted>
        You completed {SERIES_ONE.title}. Choose where your practice goes from here.
      </AppText>
      <Gap size="lg" />
      {next ? (
        <ListRow
          label="Start the next chapter"
          sub={`Chapter ${chapterNumber(next)} · ${next.title}`}
          onPress={startNext}
          testID="start-next-series"
        />
      ) : (
        <AppText variant="small" muted>
          No more series are available yet — more are coming soon.
        </AppText>
      )}
      <ListRow
        label="Replay this chapter — same questions"
        sub="Sit with the original contemplations again"
        onPress={() => replay(false)}
      />
      <ListRow
        label="Replay this chapter — new questions"
        sub="Alternate contemplations on the same theme"
        onPress={() => replay(true)}
        testID="replay-alt"
      />
      <Spacer />
      <Button label="Back to Home" kind="ghost" onPress={() => router.replace('/home')} />
      <Gap size="lg" />
    </Screen>
  );
}
