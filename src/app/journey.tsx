/**
 * Journey (was Menu) — full-screen dark surface. The record of the practice:
 * big-caps index (Series first, per Kat), recent journal entries (grayed
 * until revealed), completed series, and quiet utility rows.
 * Subscription lives on Account, not here.
 */
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { TabScreen } from '@/components/BottomNav';
import { AppText, Gap } from '@/components/ui';
import { dailyQuote } from '@/content/copy';
import { getSeries, orderedSeries } from '@/content/series';
import { isSeriesCompleted } from '@/services/logic';
import { useApp } from '@/services/provider';
import { space } from '@/theme/tokens';

const INDEX: { label: string; route: string; testID: string }[] = [
  { label: 'Series', route: '/library', testID: 'journey-series' },
  { label: 'Your Journal', route: '/reflections', testID: 'journey-journal' },
  { label: 'Learn', route: '/learn', testID: 'journey-learn' },
];


export default function Journey() {
  const { data } = useApp();
  const quote = dailyQuote();
  const recent = [...data.diary]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);
  const completed = orderedSeries().filter((s) => isSeriesCompleted(data, s));

  return (
    <TabScreen active="journey" dark>
      <Gap size="xl" />
      <AppText variant="body" dark style={{ fontStyle: 'italic' }}>
        “{quote.text}”
      </AppText>
      <Gap size="xs" />
      <AppText variant="label" dark muted>
        {quote.by}
      </AppText>
      <Gap size="xl" />
      {INDEX.map((item) => (
        <Pressable
          key={item.route}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          onPress={() => router.push(item.route as never)}
          style={({ pressed }) => [styles.indexItem, pressed && { opacity: 0.6 }]}
          testID={item.testID}>
          <AppText variant="title" dark>
            {item.label}
          </AppText>
        </Pressable>
      ))}

      {/* Recent journal entries: registered by date + series, grayed until revealed */}
      <Gap size="xl" />
      <AppText variant="label" dark muted>
        Recent entries
      </AppText>
      <Gap size="sm" />
      {recent.length === 0 ? (
        <AppText variant="small" dark muted>
          Your reflections will gather here as you practice.
        </AppText>
      ) : (
        recent.map((e) => {
          const seriesTitle = getSeries(e.seriesId)?.title ?? '';
          return (
            <Pressable
              key={e.id}
              accessibilityRole="button"
              accessibilityLabel={`Journal entry, ${seriesTitle}`}
              onPress={() => router.push('/reflections')}
              style={({ pressed }) => [
                styles.entryRow,
                pressed && { opacity: 0.6 },
                !e.isRevealed && { opacity: 0.45 },
              ]}>
              <View style={{ flex: 1 }}>
                <AppText variant="label" dark muted>
                  {new Date(e.createdAt).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                  })}
                  {' · '}
                  {seriesTitle}
                </AppText>
                <AppText variant="small" dark muted={!e.isRevealed}>
                  {e.isRevealed
                    ? (e.text ?? 'Voice memo')
                    : 'Reveals when the series completes'}
                </AppText>
              </View>
              <AppText variant="small" dark muted>
                {e.isRevealed ? '›' : '·'}
              </AppText>
            </Pressable>
          );
        })
      )}

      {/* Completed series */}
      <Gap size="xl" />
      <AppText variant="label" dark muted>
        Series completed
      </AppText>
      <Gap size="sm" />
      {completed.length === 0 ? (
        <AppText variant="small" dark muted>
          None yet. The first one is underway.
        </AppText>
      ) : (
        completed.map((s) => (
          <Pressable
            key={s.id}
            accessibilityRole="button"
            accessibilityLabel={s.title}
            onPress={() =>
              router.push({ pathname: '/series/[seriesId]', params: { seriesId: s.id } })
            }
            style={({ pressed }) => [styles.entryRow, pressed && { opacity: 0.6 }]}>
            <AppText variant="small" dark style={{ flex: 1 }}>
              {s.title}
            </AppText>
            <AppText variant="small" dark>
              ✓
            </AppText>
          </Pressable>
        ))
      )}

      {/* Push resources toward the bottom of the screen */}
      <View style={{ flexGrow: 1, minHeight: space.xxl }} />
      <View style={styles.rule} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mental Health Resources"
        onPress={() => router.push('/resources')}
        style={({ pressed }) => [styles.utilityRow, pressed && { opacity: 0.6 }]}
        testID="journey-resources">
        <AppText variant="bodyBold" dark>
          Mental Health Resources
        </AppText>
        <AppText variant="body" dark muted>
          {'\u203a'}
        </AppText>
      </Pressable>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  indexItem: { paddingVertical: space.md, minHeight: 44 },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(239,233,219,0.15)',
  },
  rule: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(239,233,219,0.3)',
    marginBottom: space.md,
  },
  utilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(239,233,219,0.15)',
  },
});
