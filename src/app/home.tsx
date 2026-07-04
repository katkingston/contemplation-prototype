/**
 * C1 — Home. Empty top (nav lives in the bottom bar, per Open reference).
 * The hero fills the first screen but REVEALS NOTHING: series, number within
 * the series, and a one-or-two-word hint. The question itself appears only in
 * the contemplation. Completed contemplations show their full prompt below.
 */
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '@/components/BottomNav';
import { AppText, Button, Eyebrow, Gap, ListRow, Row, StatusPill } from '@/components/ui';
import { orderedSeries, seriesLength } from '@/content/series';
import {
  activeSeries,
  dropLabel,
  hasActiveAccess,
  isDropAvailable,
  isSeriesAtWrap,
  isSeriesCompleted,
  isSeriesUnlocked,
  nextDropAt,
  progressFor,
  questionFor,
} from '@/services/logic';
import { useApp } from '@/services/provider';
import { color, radius, space } from '@/theme/tokens';

export default function Home() {
  const { data } = useApp();
  const { height: windowHeight } = useWindowDimensions();
  const [listOpen, setListOpen] = useState(false);
  const series = activeSeries(data);
  const p = progressFor(data, series.id);
  const atWrap = isSeriesAtWrap(data, series);
  const idx = Math.min(p.currentIndex, seriesLength(series) - 1);
  const next = series.contemplations[idx];
  const isFirstOfSeries = p.currentIndex === 0;
  const accessOk = hasActiveAccess(data, series.id);
  const dropReady = isDropAvailable(data, series.id);
  const dropAt = nextDropAt(data, series.id);

  // Hero fills the first viewport above the bottom bar.
  const heroHeight = Math.max(420, windowHeight - 210);

  const onPlay = () => {
    if (atWrap) {
      router.push({ pathname: '/series-wrap', params: { seriesId: series.id } });
      return;
    }
    if (!accessOk) {
      router.push('/subscription');
      return;
    }
    if (!dropReady) return; // next contemplation hasn't dropped yet
    if (isFirstOfSeries) {
      router.push({ pathname: '/series-intro', params: { seriesId: series.id } });
    } else {
      router.push({ pathname: '/get-ready', params: { seriesId: series.id, index: String(idx) } });
    }
  };

  return (
    <SafeAreaView style={styles.shell} edges={['top', 'left', 'right']} testID="home-screen">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: 120, flexGrow: 1 }}>
        <Gap size="md" />
        <View style={[styles.hero, { height: heroHeight }]}>
          <LinearGradient
            colors={next ? [next.gradient[0], next.gradient[1]] : ['#333', '#555']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <AppText variant="label" style={{ color: 'rgba(239,233,219,0.75)' }}>
            Today
          </AppText>
          <View style={{ flex: 1 }} />
          <AppText variant="small" style={{ color: 'rgba(239,233,219,0.8)' }}>
            {series.title}
          </AppText>
          <Gap size="sm" />
          <AppText variant="display" style={{ color: '#efe9db' }}>
            {atWrap ? 'Complete' : `No. ${idx + 1} — ${next?.hint ?? ''}`}
          </AppText>
          <Gap size="xl" />
          {!atWrap && !dropReady && dropAt ? (
            <AppText variant="label" style={{ color: 'rgba(239,233,219,0.85)' }}>
              New contemplation at {dropLabel(dropAt)}
            </AppText>
          ) : (
            <Button
              label={atWrap ? 'See your wrap-up' : 'Begin'}
              kind="secondary"
              dark
              arrow
              onPress={onPlay}
              testID="hero-play"
            />
          )}
          <View style={{ flex: 1 }} />
        </View>
        {!accessOk && (
          <>
            <Gap size="sm" />
            <AppText variant="caption" style={{ color: color.danger }}>
              Your access has ended — renew in Subscription to continue.
            </AppText>
          </>
        )}
        <Eyebrow>Your series</Eyebrow>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: listOpen }}
          onPress={() => setListOpen((o) => !o)}
          testID="series-toggle">
          <Row between>
            <View style={{ flex: 1 }}>
              <AppText variant="heading">
                Series {series.displayOrder} — {series.title}
              </AppText>
              <AppText variant="label" muted>
                {p.currentIndex} of {seriesLength(series)} complete
              </AppText>
            </View>
            <AppText variant="heading" muted>
              {listOpen ? '⌃' : '⌄'}
            </AppText>
          </Row>
        </Pressable>
        {listOpen &&
          series.contemplations.map((c, i) => {
            const done = i < p.currentIndex;
            const today = i === p.currentIndex && !atWrap;
            // Prompts stay hidden until completed — number + hint only.
            const label = done ? questionFor(data, series, i) : `No. ${i + 1} — ${c.hint}`;
            return (
              <ListRow
                key={c.id}
                label={label}
                right={
                  <StatusPill
                    label={done ? '✓ Done' : today ? 'Today' : 'Upcoming'}
                    kind={done ? 'done' : today ? 'progress' : 'locked'}
                  />
                }
                onPress={today ? onPlay : undefined}
              />
            );
          })}
        <Eyebrow>All series</Eyebrow>
        {orderedSeries().map((s) => {
          const completed = isSeriesCompleted(data, s);
          const unlocked = isSeriesUnlocked(data, s);
          const isActive = s.id === series.id;
          return (
            <ListRow
              key={s.id}
              label={`${s.displayOrder} · ${s.title}`}
              sub={s.theme}
              right={
                <StatusPill
                  label={completed ? '✓ Done' : isActive ? 'In progress' : unlocked ? 'Available' : 'Locked'}
                  kind={completed ? 'done' : isActive ? 'progress' : unlocked ? 'neutral' : 'locked'}
                />
              }
            />
          );
        })}
        <Gap size="md" />
        <AppText variant="caption" muted>
          More series coming soon.
        </AppText>
      </ScrollView>
      <BottomNav active="today" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: color.paper },
  hero: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
    alignItems: 'flex-start',
  },
});
