/**
 * C2 — Series Introduction (Jul 30 designs): dark surface, mono caps header
 * ("CHAPTER 1 — INTRODUCTION"), centered mono slide text, underlined Next.
 * A tap anywhere on the screen advances. Cannot be skipped: Continue only
 * appears once the user has stepped through every slide. Replayable from the
 * menu.
 */
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { AppText, Gap, Screen, Spacer } from '@/components/ui';
import { chapterNumber, getSeries } from '@/content/series';
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

  const nextLabel = last ? (isReplayView ? 'Close' : 'Continue') : 'Next';

  return (
    // A tap ANYWHERE advances — the link is the affordance, not the only
    // target. One handler on the wrapper, so the label below is purely visual
    // and a tap on it can't fire twice.
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={nextLabel}
      onPress={onNext}
      style={styles.flex}
      testID="intro-next">
      <Screen dark scroll={false} testID="series-intro">
        <Gap size="md" />
        <AppText variant="label" dark muted>
          Chapter {chapterNumber(series)} — Introduction
        </AppText>
        <Spacer />
        <AppText variant="contemplation" dark center>
          {slides[slide]}
        </AppText>
        <Spacer />
        <AppText variant="bodyBold" dark style={styles.nextLabel}>
          {isReplayView ? nextLabel : `${nextLabel} →`}
        </AppText>
        <Gap size="lg" />
      </Screen>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  nextLabel: { textDecorationLine: 'underline' },
});
