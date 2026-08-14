/**
 * S1 — Chapter wrap-up: closing slides, which mark the chapter complete and
 * reveal its diary entries.
 * Cadence (Kat, Aug 14): chapters 1–3 end on a SHORT BEAT — slides only, then
 * straight back to Home for the next chapter. The LAST chapter closes the
 * whole series, so it also asks the quality-of-life question and continues
 * into the stats page and completion survey.
 */
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, ChipGroup, Dots, Gap, Screen, Spacer } from '@/components/ui';
import { qualityOfLifeQuestion } from '@/content/copy';
import { chapterNumber, getSeries, isLastChapter, SERIES_ONE } from '@/content/series';
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
  const seriesEnd = isLastChapter(series);
  // The QoL question belongs to the series, so only the final chapter asks it.
  const onQuestion = seriesEnd && slide >= slides.length;
  const lastSlide = slide >= slides.length - 1;

  const finishChapter = async () => {
    const ok = await act(async (s) => {
      if (seriesEnd) {
        await s.saveSurvey(series.id, { [qualityOfLifeQuestion.id]: qol ?? 0 });
      }
      await s.markSeriesComplete(series.id);
    });
    if (!ok) return;
    // Series end → stats + survey. Chapter beat → back to Home for the next one.
    if (seriesEnd) router.replace({ pathname: '/stats', params: { seriesId: series.id } });
    else router.replace('/home');
  };

  const advance = () => {
    if (onQuestion) return void finishChapter();
    // Chapter beat: the last slide IS the end — no question step to walk into.
    if (!seriesEnd && lastSlide) return void finishChapter();
    setSlide(slide + 1);
  };

  return (
    <Screen scroll={false} testID="series-wrap">
      <Gap size="lg" />
      <Dots
        count={slides.length + (seriesEnd ? 1 : 0)}
        active={Math.min(slide, slides.length)}
      />
      <Gap size="lg" />
      <AppText variant="label" muted>
        {seriesEnd
          ? `${SERIES_ONE.title} — Complete`
          : `Chapter ${chapterNumber(series)} — ${series.title}`}
      </AppText>
      <Spacer />
      {!onQuestion ? (
        <AppText variant="contemplation">{slides[slide]}</AppText>
      ) : (
        <View>
          <AppText variant="titleLower">{qualityOfLifeQuestion.prompt}</AppText>
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
        label={onQuestion || (!seriesEnd && lastSlide) ? 'Continue' : 'Next'}
        arrow
        disabled={onQuestion && qol == null}
        onPress={advance}
        testID="wrap-next"
      />
      <Gap size="lg" />
    </Screen>
  );
}
