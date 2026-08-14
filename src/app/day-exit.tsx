/**
 * C7 — Day Exit (Jul 30 designs). Close the day: mono header, centered
 * closing line in the typewriter voice, "See you tomorrow" with the next
 * session time, and a quiet Exit link. Next open resumes where left off.
 */
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RatingPrompt } from '@/components/RatingPrompt';
import { Fade, ScreenFade } from '@/components/Transitions';
import { AppText, Gap, MonoHeader, TextLink } from '@/components/ui';
import { dayExit } from '@/content/copy';
import { getSeries, seriesCode } from '@/content/series';
import { dropLabel, nextDropAt } from '@/services/logic';
import { useApp } from '@/services/provider';
import { color, space } from '@/theme/tokens';

export default function DayExit() {
  const { data } = useApp();
  const params = useLocalSearchParams<{ seriesId?: string; index?: string }>();
  const series = getSeries(params.seriesId ?? '');
  const index = Number(params.index ?? '0') || 0;
  const hint = series?.contemplations[index]?.hint ?? '';
  // Rotate the closing line by days practiced so it changes across the series.
  const daysPracticed = new Set(data.sessions.map((s) => s.date)).size;
  const closer = dayExit.closers[daysPracticed % dayExit.closers.length];
  const dropAt = series ? nextDropAt(data, series.id) : null;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.content}>
        <Gap size="md" />
        {series ? <MonoHeader code={seriesCode(series, index)} title={hint} dark /> : null}
        <View style={{ flex: 1 }} />
        <ScreenFade>
          <AppText variant="monoBody" dark center style={{ fontSize: 17 }}>
            {closer}
          </AppText>
        </ScreenFade>
        <Gap size="lg" />
        <Fade delay={400}>
          <AppText variant="caption" dark muted center>
            {dayExit.body}
          </AppText>
          <AppText variant="caption" dark muted center>
            {dayExit.body2}
          </AppText>
        </Fade>
        <View style={{ flex: 1 }} />
        <Fade delay={700}>
          <AppText variant="body" dark>
            {dayExit.title}
          </AppText>
          {dropAt ? (
            <>
              <Gap size="xs" />
              <AppText variant="label" dark muted>
                {`Next — ${dropLabel(dropAt)}`}
              </AppText>
            </>
          ) : null}
        </Fade>
        <Gap size="xl" />
        <Fade delay={900}>
          <TextLink label="Finish" dark onPress={() => router.replace('/home')} testID="day-exit-done" />
        </Fade>
        <Gap size="lg" />
        <RatingPrompt />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.dark },
  content: { flex: 1, paddingHorizontal: space.lg },
});
