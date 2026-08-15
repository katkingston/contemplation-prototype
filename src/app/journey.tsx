/**
 * Journey — the practice record (Jul 30 designs): light surface, lowercase
 * title, 2×2 stats, then dated reflections with dotted separators. Reached
 * from the Journey-tab menu. Entries stay held back until their chapter completes.
 */
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TabScreen } from '@/components/BottomNav';
import { AppText, Gap, Row, TextLink } from '@/components/ui';
import { activeSeries, lifetimeStats, progressFor } from '@/services/logic';
import { seriesLength } from '@/content/series';
import { useApp } from '@/services/provider';
import { color, font, space } from '@/theme/tokens';

const RECENT_COUNT = 5;

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
  const s = activeSeries(data);
  const p = progressFor(data, s.id);
  const len = seriesLength(s);
  const entries = [...data.diary].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const recent = entries.slice(0, RECENT_COUNT);

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
        <Stat wide value={`${Math.min(p.currentIndex, len)}/${len}`} label="Days complete" />
        <Stat value={String(life.currentStreak)} label="Day streak" />
      </View>
      <View style={{ height: 73 }} />
      {recent.length === 0 ? (
        <>
          <View style={styles.dotted} />
          <Gap size="md" />
          <AppText variant="small" muted>
            Your reflections will gather here as you practice.
          </AppText>
        </>
      ) : (
        recent.map((e) => (
          <View key={e.id}>
            <View style={styles.dotted} />
            <Gap size="md" />
            <Row between>
              <AppText variant="label" muted>
                Reflection
              </AppText>
              <AppText variant="label" muted>
                {new Date(e.createdAt).toLocaleDateString(undefined, {
                  year: '2-digit',
                  month: '2-digit',
                  day: '2-digit',
                })}
              </AppText>
            </Row>
            <Gap size="md" />
            {e.isRevealed ? (
              <>
                <AppText variant="bodyBold">{e.prompt}</AppText>
                <Gap size="xs" />
                <AppText variant="body" muted>
                  {e.text ?? 'Voice memo'}
                </AppText>
              </>
            ) : (
              <AppText variant="body" muted style={{ opacity: 0.6 }}>
                A reflection is held here. It reveals when the chapter completes.
              </AppText>
            )}
            <Gap size="md" />
          </View>
        ))
      )}
      {entries.length > 0 ? (
        <>
          <View style={styles.dotted} />
          <Gap size="lg" />
          <TextLink label="Your Journal" arrow onPress={() => router.push('/reflections')} testID="journey-journal" />
        </>
      ) : null}
      <Gap size="xl" />
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
  dotted: {
    borderTopWidth: 1,
    borderTopColor: color.line,
    borderStyle: 'dotted',
  },
});
