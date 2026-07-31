/**
 * S1 — Series Wrap-up: closing slides + one quality-of-life question.
 * Completing the wrap marks the series complete and reveals the diary.
 */
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, ChipGroup, Dots, Gap, Screen, Spacer } from '@/components/ui';
import { qualityOfLifeQuestion } from '@/content/copy';
import { getSeries } from '@/content/series';
import { useApp } from '@/services/provider';

export default function SeriesWrap() {
  const { act } = useApp();
  const params = useLocalSearchParams<{ seriesId?: string }>();
  const series = getSeries(params.seriesId ?? '');
  const [slide, setSlide] = useState(0);
  const [qol, setQol] = useState<number | null>(null);

  if (!series) {
    router.replace('/home');
    return null;
  }
  const slides = series.wrapSlides;
  const onQuestion = slide >= slides.length;

  const complete = async () => {
    const ok = await act(async (s) => {
      await s.saveSurvey(series.id, { [qualityOfLifeQuestion.id]: qol ?? 0 });
      await s.markSeriesComplete(series.id);
    });
    if (ok) router.replace({ pathname: '/stats', params: { seriesId: series.id } });
  };

  return (
    <Screen scroll={false} testID="series-wrap">
      <Gap size="lg" />
      <Dots count={slides.length + 1} active={Math.min(slide, slides.length)} />
      <Gap size="lg" />
      <AppText variant="label" muted>
        Series {series.displayOrder} — {series.title}
      </AppText>
      <Spacer />
      {!onQuestion ? (
        <AppText variant="contemplation">
          {slides[slide]}
        </AppText>
      ) : (
        <View>
          <AppText variant="titleLower">
            {qualityOfLifeQuestion.prompt}
          </AppText>
          <Gap size="lg" />
          <ChipGroup
            options={Array.from(
              { length: qualityOfLifeQuestion.max - qualityOfLifeQuestion.min + 1 },
              (_, i) => qualityOfLifeQuestion.min + i,
            )}
            value={qol}
            onChange={setQol}
          />
          <Gap size="sm" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="small" muted>
              {qualityOfLifeQuestion.minLabel}
            </AppText>
            <AppText variant="small" muted>
              {qualityOfLifeQuestion.maxLabel}
            </AppText>
          </View>
        </View>
      )}
      <Spacer />
      <Button
        label={onQuestion ? 'Continue' : 'Next'}
        arrow
        disabled={onQuestion && qol == null}
        onPress={onQuestion ? complete : () => setSlide(slide + 1)}
        testID="wrap-next"
      />
      <Gap size="lg" />
    </Screen>
  );
}
