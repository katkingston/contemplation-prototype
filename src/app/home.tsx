/**
 * C1 — Home. The next contemplation fills the whole first screen (press play);
 * scrolling down reveals the active series (contemplations collapsed under the
 * series title) and the rest of the library. Menu top-left, account top-right.
 */
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
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
import { color, font, radius, space } from '@/theme/tokens';

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
  const initial = (data.profile?.username?.[0] ?? '•').toUpperCase();

  // Hero fills the first viewport (minus the header strip).
  const heroHeight = Math.max(420, windowHeight - 150);

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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Account"
          onPress={() => router.push('/account')}
          style={styles.avatar}
          testID="account-icon">
          <AppText variant="small" style={{ color: color.ink, fontFamily: font.monoBold }}>
            {initial}
          </AppText>
        </Pressable>
      </Row>
      <Gap size="sm" />
      <Pressable accessibilityRole="button" onPress={onPlay} testID="hero-play">
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
          <AppText variant="contemplation" center style={{ color: '#efe9db' }}>
            {atWrap ? 'Series complete' : questionFor(data, series, idx)}
          </AppText>
          <Gap size="xl" />
          <View style={styles.play}>
            <AppText variant="heading" style={{ color: '#efe9db' }}>
              ▶
            </AppText>
          </View>
          <View style={{ flex: 1 }} />
          <AppText variant="label" style={{ color: 'rgba(239,233,219,0.6)' }} center>
            {atWrap ? 'see your wrap-up' : 'scroll for your series'}
          </AppText>
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
      <AppText variant="label" muted>
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
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
    alignItems: 'center',
  },
  play: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#efe9db',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: color.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
