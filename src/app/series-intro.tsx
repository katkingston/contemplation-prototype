/**
 * C2 — Series Introduction (Jul 30 designs): dark surface, mono caps header
 * ("SERIES 1 — INTRODUCTION"), centered mono slide text, underlined Next.
 * Cannot be skipped: Continue unlocks only after the user has stepped through
 * every slide. Replayable from the menu.
 */
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { AppText, Gap, Screen, Spacer, TextLink } from '@/components/ui';
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
    <Screen dark scroll={false} testID="series-intro">
      <Gap size="md" />
      <AppText variant="label" dark muted>
        Series {series.displayOrder} — Introduction
      </AppText>
      <Spacer />
      <AppText variant="contemplation" dark center>
        {slides[slide]}
      </AppText>
      <Spacer />
      {!last && (
        <AppText variant="caption" dark muted>
          No skip — the introduction completes before the first contemplation
        </AppText>
      )}
      <Gap size="md" />
      <TextLink
        label={last ? (isReplayView ? 'Close' : 'Continue') : 'Next'}
        dark
        arrow={!isReplayView}
        onPress={onNext}
        testID="intro-next"
      />
      <Gap size="lg" />
    </Screen>
  );
}
