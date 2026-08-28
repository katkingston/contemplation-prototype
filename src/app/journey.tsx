/**
 * Journey — the practice record (Jul 30 designs, S4 stat setting): lowercase
 * title, 2×2 lifetime stats, Back. Reflections no longer surface here (Kat,
 * Aug 17) — they live in the journal and the series-end wrap instead. "Days
 * complete" counts every day contemplated, not progress through one chapter.
 */
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TabScreen } from '@/components/BottomNav';
import { AppText, Gap, Spacer, TextLink } from '@/components/ui';
import { lifetimeStats } from '@/services/logic';
import { useApp } from '@/services/provider';
import { color, font, space } from '@/theme/tokens';

/** S4: a 36/44 mono numeral over an 11px label, 4 apart. */
function Stat({ value, label, wide = false }: { value: string; label: string; wide?: boolean }) {
  return (
    <View style={wide ? styles.statCellLeft : styles.statCellRight}>
      <AppText style={styles.statValue as never}>{value}</AppText>
      <AppText variant="caption" muted style={{ marginTop: 4 }}>
        {label}
      </AppText>
    </View>
  );
}

export default function Journey() {
  const { data } = useApp();
  const life = lifetimeStats(data);

  return (
    // S4: "journey" 61 at 34, stat pairs on 182 and 279 with their labels at
    // 230 and 328, right column starting at 206.
    <TabScreen active="journey">
      <View style={{ height: 61 }} />
      <AppText variant="heroTitle">journey</AppText>
      <View style={{ height: 82 }} />
      <View style={styles.statsRow}>
        <Stat wide value={String(life.minutes)} label="Minutes contemplating" />
        <Stat value={String(data.diary.length)} label="Thoughts shared" />
      </View>
      <View style={{ height: 34 }} />
      <View style={styles.statsRow}>
        <Stat wide value={String(life.daysPracticed)} label="Days contemplated" />
        <Stat value={String(life.currentStreak)} label="Day streak" />
      </View>
      <Spacer />
      <Gap size="xl" />
      <TextLink
        label="Back"
        center
        muted
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/menu' as never))}
        testID="journey-back"
      />
      <Gap size="lg" />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row' },
  // The right column starts at 206, not at the midpoint.
  statCellLeft: { width: 182, paddingRight: space.md },
  statCellRight: { flex: 1 },
  statValue: {
    fontFamily: font.mono,
    fontSize: 36,
    lineHeight: 44,
    color: color.ink,
  },
});
