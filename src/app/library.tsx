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
      {/* S3 Library: ONE series artwork (27→277), the series title at 390, then
          its chapters on a 67pt pitch from 455. The dots belong to the rows as
          completion indicators — there is no carousel here. */}
      <View style={{ height: 27 }} />
      <View style={styles.hero}>
        <SeriesArt
          gradient={hero.contemplations[0].gradient}
          accent={(seriesPalettes[hero.id] ?? ['#232619', '#4c5232', '#6f7036'])[2]}
          seed={hero.displayOrder}
          style={StyleSheet.absoluteFill as never}
        />
      </View>
      <View style={{ height: 113 }} />
      {/* S3 sets the series title over two lines, so the well is fixed at 48
          and the chapter rows always begin on 455 however short the name is. */}
      <View style={{ height: 48 }}>
        <AppText variant="heading">{SERIES_ONE.title}</AppText>
      </View>
      <View style={{ height: 17 }} />
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
    // 67pt pitch: a two-line 15/21 chapter title with 12.5 either side.
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: 12.5,
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
