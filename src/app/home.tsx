/**
 * C1 — Home: next contemplation as the hero (press play), then the active
 * series (titled, no day numbers) and other content below.
 */
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Button, Gap, ListRow, Row, Screen, StatusPill } from '@/components/ui';
import { orderedSeries, seriesLength } from '@/content/series';
import {
  activeSeries,
  hasActiveAccess,
  isSeriesAtWrap,
  isSeriesCompleted,
  isSeriesUnlocked,
  progressFor,
  questionFor,
} from '@/services/logic';
import { useApp } from '@/services/provider';
import { color, radius, space } from '@/theme/tokens';

export default function Home() {
  const { data } = useApp();
  const series = activeSeries(data);
  const p = progressFor(data, series.id);
  const atWrap = isSeriesAtWrap(data, series);
  const idx = Math.min(p.currentIndex, seriesLength(series) - 1);
  const next = series.contemplations[idx];
  const isFirstOfSeries = p.currentIndex === 0;
  const accessOk = hasActiveAccess(data, series.id);

  const onPlay = () => {
    if (atWrap) {
      router.push({ pathname: '/series-wrap', params: { seriesId: series.id } });
      return;
    }
    if (!accessOk) {
      router.push('/subscription');
      return;
    }
    if (isFirstOfSeries) {
      router.push({ pathname: '/series-intro', params: { seriesId: series.id } });
    } else {
      router.push({ pathname: '/get-ready', params: { seriesId: series.id, index: String(idx) } });
    }
  };

  return (
    <Screen testID="home-screen">
      <Gap size="sm" />
      <Row between>
        <Button label="≡ Menu" kind="ghost" small onPress={() => router.push('/menu')} testID="menu-button" />
        <View />
      </Row>
      <Gap size="md" />
      <AppText variant="title">Today</AppText>
      <Gap size="md" />
      <Pressable accessibilityRole="button" onPress={onPlay} testID="hero-play">
        <View style={styles.hero}>
          <LinearGradient
            colors={next ? [next.gradient[0], next.gradient[1]] : ['#333', '#555']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <AppText variant="small" style={{ color: 'rgba(255,255,255,0.85)' }} center>
            {atWrap
              ? 'Series complete — see your wrap-up'
              : `next contemplation — ${questionFor(data, series, idx).slice(0, 60)}…`}
          </AppText>
          <Gap size="md" />
          <View style={styles.play}>
            <AppText variant="heading" style={{ color: '#fff' }}>
              ▶
            </AppText>
          </View>
        </View>
      </Pressable>
      {!accessOk && (
        <>
          <Gap size="sm" />
          <AppText variant="caption" style={{ color: color.danger }}>
            Your access has ended — renew in Subscription to continue.
          </AppText>
        </>
      )}
      <Gap size="lg" />
      <AppText variant="heading">
        Series {series.displayOrder} — {series.title}
      </AppText>
      <Gap size="xs" />
      {series.contemplations.map((c, i) => {
        const done = i < p.currentIndex;
        const today = i === p.currentIndex && !atWrap;
        return (
          <ListRow
            key={c.id}
            label={questionFor(data, series, i).split('?')[0].slice(0, 42) + '…'}
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
      <Gap size="lg" />
      <AppText variant="small" muted>
        All series
      </AppText>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    paddingVertical: space.xl,
    paddingHorizontal: space.lg,
    alignItems: 'center',
  },
  play: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
