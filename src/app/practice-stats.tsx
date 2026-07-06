/**
 * Stats — lifetime practice numbers (Open's Practice Stats reference),
 * plus per-series progress.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TabScreen } from '@/components/BottomNav';
import { SeriesDashes } from '@/components/SeriesDashes';
import { AppText, Eyebrow, Gap } from '@/components/ui';
import { orderedSeries, seriesLength } from '@/content/series';
import { lifetimeStats, progressFor } from '@/services/logic';
import { useApp } from '@/services/provider';
import { font } from '@/theme/tokens';

export default function PracticeStats() {
  const { data } = useApp();
  const stats = lifetimeStats(data);
  const cells = [
    { n: stats.currentStreak, label: 'Current streak' },
    { n: stats.bestStreak, label: 'Best streak' },
    { n: stats.contemplations, label: 'Contemplations' },
    { n: stats.minutes, label: 'Minutes practiced' },
  ];

  return (
    <TabScreen active="menu">
      <Gap size="xl" />
      <AppText variant="title">Stats</AppText>
      <Gap size="lg" />
      <View style={styles.grid}>
        {cells.map((c) => (
          <View key={c.label} style={styles.cell}>
            <AppText style={styles.big}>{c.n}</AppText>
            <AppText variant="label" muted>
              {c.label}
            </AppText>
          </View>
        ))}
      </View>
      <Eyebrow>By series</Eyebrow>
      {orderedSeries().map((s) => {
        const p = progressFor(data, s.id);
        const len = seriesLength(s);
        return (
          <View key={s.id} style={{ paddingVertical: 10 }}>
            <AppText variant="bodyBold">{s.title}</AppText>
            <Gap size="xs" />
            <SeriesDashes total={len} done={Math.min(p.currentIndex, len)} />
          </View>
        );
      })}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '50%', marginBottom: 24, paddingRight: 12 },
  big: { fontFamily: font.display, fontSize: 44, lineHeight: 48 },
});
