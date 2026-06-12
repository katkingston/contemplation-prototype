/**
 * C2 — Series Introduction. Cannot be skipped: Continue unlocks only after
 * the user has stepped through every slide. Replayable from the menu.
 */
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { AppText, Button, Dots, Gap, Screen, Spacer } from '@/components/ui';
import { getSeries } from '@/content/series';
import { useApp } from '@/services/provider';
import { progressFor } from '@/services/logic';

export default function SeriesIntro() {
  const { data } = useApp();
  const params = useLocalSearchParams<{ seriesId?: string; replay?: string }>();
  const series = getSeries(params.seriesId ?? '') ?? null;
  const [slide, setSlide] = useState(0);

  if (!series) {
    router.replace('/home');
    return null;
  }
  const slides = series.introSlides;
  const last = slide >= slides.length - 1;
  const isReplayView = params.replay === '1';

  const onNext = () => {
    if (!last) {
      setSlide(slide + 1);
      return;
    }
    if (isReplayView) {
      router.back();
    } else {
      const p = progressFor(data, series.id);
      router.replace({
        pathname: '/get-ready',
        params: { seriesId: series.id, index: String(p.currentIndex) },
      });
    }
  };

  return (
    <Screen scroll={false} testID="series-intro">
      <Gap size="lg" />
      <Dots count={slides.length} active={slide} />
      <Gap size="lg" />
      <AppText variant="small" muted center>
        Series {series.displayOrder} — {series.title}
      </AppText>
      <Spacer />
      <AppText variant="contemplation" center>
        {slides[slide]}
      </AppText>
      <Spacer />
      {!last && (
        <AppText variant="caption" muted center>
          No skip — the introduction completes before the first contemplation
        </AppText>
      )}
      <Gap size="sm" />
      <Button
        label={last ? (isReplayView ? 'Close' : 'Continue') : 'Next'}
        onPress={onNext}
        testID="intro-next"
      />
      <Gap size="lg" />
    </Screen>
  );
}
