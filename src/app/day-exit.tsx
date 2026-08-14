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
import { AppText, MonoHeader, Row, TextLink } from '@/components/ui';
import { dayExit } from '@/content/copy';
import { getSeries, seriesCode } from '@/content/series';
import { dropLabel, nextDropAt } from '@/services/logic';
import { useApp } from '@/services/provider';
import { anchor, color, space, type } from '@/theme/tokens';

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
        <View style={{ height: anchor.monoHeader }} />
        {series ? <MonoHeader code={seriesCode(series, index)} title={hint} dark /> : null}
        <View style={{ height: anchor.statement - anchor.monoHeader - 19 }} />
        {/* The closing line carries the screen on its own — body copy removed
            (Kat, Aug 14) so the day ends on one thought, not a paragraph. */}
        <ScreenFade>
          <AppText variant="monoStatement" dark center>
            {closer}
          </AppText>
        </ScreenFade>
        <View style={{ flex: 1 }} />
        {/* Finish and the next-session line share one baseline. */}
        <Fade delay={700}>
          <Row between>
            <TextLink
              label="Finish"
              dark
              onPress={() => router.replace('/home')}
              testID="day-exit-done"
            />
            {dropAt ? (
              <AppText variant="label" dark muted style={styles.nextLine}>
                {`Next — ${dropLabel(dropAt)}`}
              </AppText>
            ) : null}
          </Row>
        </Fade>
        <View style={{ height: space.lg }} />
        <RatingPrompt />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.dark },
  content: { flex: 1, paddingHorizontal: space.lg },
  /** Same line box as the Finish link so the two share a baseline. */
  nextLine: { lineHeight: type.bodyBold.lineHeight },
});
