/**
 * Library — the series browser (Jul 30 designs): lowercase "series" title,
 * a paged carousel (art + right-aligned series title + pagination dots),
 * then every series as a hairline row with its dot progress, the
 * coming-soon list, and a Back link. Grows as more series open up.
 */
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { TabScreen } from '@/components/BottomNav';
import { SeriesArt } from '@/components/SeriesArt';
import { SeriesDashes } from '@/components/SeriesDashes';
import { AppText, Dots, Gap, TextLink } from '@/components/ui';
import { COMING_SOON, orderedSeries, seriesLength } from '@/content/series';
import { isSeriesCompleted, isSeriesUnlocked, progressFor } from '@/services/logic';
import { useApp } from '@/services/provider';
import { color, radius, seriesPalettes, space } from '@/theme/tokens';

export default function Library() {
  const { data } = useApp();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const all = orderedSeries();
  const pageW = width - space.lg * 2;

  const open = (id: string) =>
    router.push({ pathname: '/series/[seriesId]', params: { seriesId: id } });

  return (
    <TabScreen active="journey">
      <Gap size="xl" />
      <AppText variant="titleLower">series</AppText>
      <Gap size="lg" />
      {/* Carousel — one card per series, pagination dots below. */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={pageW}
        decelerationRate="fast"
        onScroll={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / pageW))}
        scrollEventThrottle={64}
        style={{ marginHorizontal: -space.lg }}
        contentContainerStyle={{ paddingHorizontal: space.lg }}>
        {all.map((s) => (
          <Pressable
            key={s.id}
            accessibilityRole="button"
            accessibilityLabel={s.title}
            onPress={() => open(s.id)}
            style={({ pressed }) => [
              styles.carouselCard,
              { width: pageW },
              pressed && { opacity: 0.7 },
            ]}
            testID={`library-card-${s.id}`}>
            <View style={styles.carouselThumb}>
              <SeriesArt
                gradient={s.contemplations[0].gradient}
                accent={(seriesPalettes[s.id] ?? ['#232619', '#4c5232', '#6f7036'])[2]}
                seed={s.displayOrder}
                style={StyleSheet.absoluteFill as never}
              />
            </View>
            <AppText variant="titleLower" style={styles.carouselTitle as never}>
              {s.title}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>
      <Gap size="md" />
      <Dots count={all.length} active={Math.min(page, all.length - 1)} />
      <Gap size="xl" />
      {/* Every series with its dot progress. */}
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
  carouselCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    paddingRight: space.lg,
  },
  carouselThumb: {
    width: 88,
    height: 116,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  carouselTitle: { flex: 1, textAlign: 'right' },
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
