/**
 * Library — all series as a collection (Open's Favorites/Library reference):
 * gradient thumbnails, per-series progress dashes, completed check. Over time
 * this page grows as more series open up.
 */
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { TabScreen } from '@/components/BottomNav';
import { SeriesDashes } from '@/components/SeriesDashes';
import { AppText, Gap } from '@/components/ui';
import { orderedSeries, seriesLength } from '@/content/series';
import {
  isSeriesCompleted,
  isSeriesUnlocked,
  progressFor,
} from '@/services/logic';
import { useApp } from '@/services/provider';
import { color, radius, space } from '@/theme/tokens';

export default function Library() {
  const { data } = useApp();

  return (
    <TabScreen active="menu">
      <Gap size="xl" />
      <AppText variant="title">Series</AppText>
      <Gap size="sm" />
      <AppText variant="small" muted>
        Your practice, one series at a time. More open as you complete them.
      </AppText>
      <Gap size="lg" />
      {orderedSeries().map((s) => {
        const p = progressFor(data, s.id);
        const done = isSeriesCompleted(data, s);
        const unlocked = isSeriesUnlocked(data, s);
        const len = seriesLength(s);
        return (
          <Pressable
            key={s.id}
            accessibilityRole="button"
            accessibilityLabel={s.title}
            onPress={() => router.push({ pathname: '/series/[seriesId]', params: { seriesId: s.id } })}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
            testID={`library-${s.id}`}>
            <View style={styles.thumb}>
              <LinearGradient
                colors={[s.contemplations[0].gradient[0], s.contemplations[0].gradient[1]]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              {!unlocked && !done ? <View style={styles.thumbVeil} /> : null}
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="label" muted>
                Series {s.displayOrder}
              </AppText>
              <AppText variant="bodyBold">{s.title}</AppText>
              <Gap size="xs" />
              <SeriesDashes total={len} done={Math.min(p.currentIndex, len)} active={!done && unlocked} />
            </View>
            <AppText variant="body" muted>
              {done ? '✓' : unlocked ? '›' : '·'}
            </AppText>
          </Pressable>
        );
      })}
      <Gap size="md" />
      <AppText variant="caption" muted>
        More series coming soon.
      </AppText>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.line,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  thumbVeil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(240,236,225,0.55)' },
});
