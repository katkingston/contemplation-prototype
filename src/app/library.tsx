/**
 * Library — the series browser (S3 Library, Jul 30 designs): the series
 * artwork, the "Series 1" heading, then every CHAPTER as a hairline row whose
 * right-hand dots are ITS COMPLETION INDICATORS (not pagination — there is no
 * carousel here), the coming-soon list of future series, and a Back link.
 */
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { TabScreen } from '@/components/BottomNav';
import { SeriesArt } from '@/components/SeriesArt';
import { SeriesDashes } from '@/components/SeriesDashes';
import { AppText, Gap, TextLink } from '@/components/ui';
import { COMING_SOON, orderedSeries, seriesLength, SERIES_ONE } from '@/content/series';
import { isSeriesCompleted, isSeriesUnlocked, progressFor } from '@/services/logic';
import { useApp } from '@/services/provider';
import { color, radius, seriesPalettes, space } from '@/theme/tokens';

export default function Library() {
  const { data } = useApp();
  const all = orderedSeries();
  const hero = all[0]; // the series' cover artwork

  const open = (id: string) =>
    router.push({ pathname: '/series/[seriesId]', params: { seriesId: id } });

  return (
    <TabScreen active="journey">
      <Gap size="md" />
      {/* S3 Library: ONE series artwork, the series title, then its chapters.
          (The dots belong to the rows as completion indicators — there is no
          carousel and no pagination on this screen.) */}
      <View style={styles.hero}>
        <SeriesArt
          gradient={hero.contemplations[0].gradient}
          accent={(seriesPalettes[hero.id] ?? ['#232619', '#4c5232', '#6f7036'])[2]}
          seed={hero.displayOrder}
          style={StyleSheet.absoluteFill as never}
        />
      </View>
      <Gap size="xxl" />
      <AppText variant="titleLower">{SERIES_ONE.title}</AppText>
      <Gap size="md" />
      {all.map((s) => {
        const p = progressFor(data, s.id);
        const done = isSeriesCompleted(data, s);
        const unlocked = isSeriesUnlocked(data, s);
        const len = seriesLength(s);
        return (
          <Pressable
            key={s.id}
            accessibilityRole="button"
            accessibilityLabel={s.title}
            onPress={() => open(s.id)}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
            testID={`library-${s.id}`}>
            <View style={{ flex: 1, opacity: unlocked || done ? 1 : 0.5 }}>
              <AppText variant="bodyBold" numberOfLines={2}>
                {s.title}
              </AppText>
            </View>
            <SeriesDashes total={len} done={Math.min(p.currentIndex, len)} active={!done && unlocked} />
          </Pressable>
        );
      })}
      <View style={styles.endRule} />
      <Gap size="xl" />
      <AppText variant="monoBody" muted>
        coming soon
      </AppText>
      {COMING_SOON.map((c) => (
        <View key={c.title} style={styles.comingRow}>
          <AppText variant="bodyBold" style={{ color: color.locked }}>
            {c.title}
          </AppText>
        </View>
      ))}
      <Gap size="xl" />
      <TextLink
        label="Back"
        muted
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/menu' as never))}
        testID="library-back"
      />
      <Gap size="lg" />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  hero: { height: 250, borderRadius: radius.sm, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.muted,
  },
  endRule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.muted },
  comingRow: {
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: color.line,
    borderStyle: 'dotted',
  },
});
