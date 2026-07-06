/**
 * C1 — Home, Open-Discover style: artwork-led. The today hero REVEALS
 * NOTHING (series, number, hint only — the question appears only inside the
 * contemplation). Below: a horizontal artwork rail for the active series and
 * image-led rows for all series. Section headers carry SEE ALL links.
 */
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '@/components/BottomNav';
import { SeriesArt } from '@/components/SeriesArt';
import { SeriesDashes } from '@/components/SeriesDashes';
import { AppText, Button, Gap } from '@/components/ui';
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
} from '@/services/logic';
import { useApp } from '@/services/provider';
import { color, radius, seriesPalettes, space } from '@/theme/tokens';

function SectionHeader({ label, onSeeAll }: { label: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="label" muted>
        {label}
      </AppText>
      {onSeeAll ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`See all, ${label}`}
          hitSlop={10}
          onPress={onSeeAll}>
          <AppText variant="label" muted>
            See all →
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function Home() {
  const { data } = useApp();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const series = activeSeries(data);
  const palette = seriesPalettes[series.id] ?? ['#232619', '#4c5232', '#6f7036'];
  const p = progressFor(data, series.id);
  const atWrap = isSeriesAtWrap(data, series);
  const len = seriesLength(series);
  const idx = Math.min(p.currentIndex, len - 1);
  const next = series.contemplations[idx];
  const isFirstOfSeries = p.currentIndex === 0;
  const accessOk = hasActiveAccess(data, series.id);
  const dropReady = isDropAvailable(data, series.id);
  const dropAt = nextDropAt(data, series.id);

  const heroHeight = Math.min(680, Math.max(420, windowHeight - 230));
  const cardW = Math.min(190, windowWidth * 0.44);

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

  const openSeries = (id: string) =>
    router.push({ pathname: '/series/[seriesId]', params: { seriesId: id } });

  return (
    <SafeAreaView style={styles.shell} edges={['top', 'left', 'right']} testID="home-screen">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}>
        <Gap size="md" />
        {/* Today hero — artwork-led */}
        <View style={{ paddingHorizontal: space.lg }}>
          <View style={[styles.hero, { height: heroHeight }]}>
            <SeriesArt
              gradient={next ? next.gradient : ['#333', '#555']}
              accent={palette[2]}
              seed={idx}
              style={StyleSheet.absoluteFill as never}
            />
            <View style={styles.heroScrim} />
            <AppText variant="label" style={{ color: 'rgba(239,233,219,0.8)' }}>
              Today ·{' '}
              {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
            </AppText>
            <View style={{ flex: 1 }} />
            <AppText variant="small" style={{ color: 'rgba(239,233,219,0.85)' }}>
              {series.title}
            </AppText>
            <Gap size="sm" />
            <AppText variant="display" style={{ color: '#efe9db' }}>
              {atWrap ? 'Complete' : `No. ${idx + 1} · ${next?.hint ?? ''}`}
            </AppText>
            <Gap size="xl" />
            {!atWrap && !dropReady && dropAt ? (
              <AppText variant="label" style={{ color: 'rgba(239,233,219,0.9)' }}>
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
                Your access has ended. Renew in Subscription to continue.
              </AppText>
            </>
          )}
        </View>

        {/* Active series — horizontal artwork rail */}
        <Gap size="xl" />
        <View style={{ paddingHorizontal: space.lg }}>
          <SectionHeader
            label={`This series · ${p.currentIndex} of ${len}`}
            onSeeAll={() => openSeries(series.id)}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.md }}>
          {series.contemplations.map((c, i) => {
            const done = i < p.currentIndex;
            const today = i === p.currentIndex && !atWrap;
            return (
              <Pressable
                key={c.id}
                accessibilityRole="button"
                accessibilityLabel={`No. ${i + 1} · ${c.hint}`}
                onPress={today ? onPlay : () => openSeries(series.id)}
                style={({ pressed }) => [{ width: cardW }, pressed && { opacity: 0.7 }]}
                testID={`rail-${c.id}`}>
                <View
                  style={[
                    styles.card,
                    { width: cardW, height: cardW * 1.2 },
                    !done && !today && { opacity: 0.55 },
                  ]}>
                  <SeriesArt
                    gradient={c.gradient}
                    accent={palette[2]}
                    seed={i}
                    style={StyleSheet.absoluteFill as never}
                  />
                  {done ? (
                    <View style={styles.cardCheck}>
                      <AppText variant="caption" style={{ color: color.onDark }}>
                        ✓
                      </AppText>
                    </View>
                  ) : null}
                </View>
                <Gap size="sm" />
                <AppText variant="label" muted>
                  No. {i + 1}
                  {today ? ' · Today' : ''}
                </AppText>
                <AppText variant="bodyBold" numberOfLines={1}>
                  {c.hint}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* All series — image-led rows */}
        <Gap size="xl" />
        <View style={{ paddingHorizontal: space.lg }}>
          <SectionHeader label="All series" onSeeAll={() => router.push('/library')} />
          {orderedSeries().map((s) => {
            const completed = isSeriesCompleted(data, s);
            const unlocked = isSeriesUnlocked(data, s);
            const sp = progressFor(data, s.id);
            const sPalette = seriesPalettes[s.id] ?? palette;
            const sLen = seriesLength(s);
            return (
              <Pressable
                key={s.id}
                accessibilityRole="button"
                accessibilityLabel={s.title}
                onPress={() => openSeries(s.id)}
                style={({ pressed }) => [styles.seriesRow, pressed && { opacity: 0.6 }]}
                testID={`home-series-${s.id}`}>
                <View style={[styles.thumb, !unlocked && !completed && { opacity: 0.45 }]}>
                  <SeriesArt
                    gradient={s.contemplations[0].gradient}
                    accent={sPalette[2]}
                    seed={s.displayOrder}
                    style={StyleSheet.absoluteFill as never}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="label" muted>
                    {s.tag}
                    {completed ? ' · Complete' : !unlocked ? ' · Locked' : ''}
                  </AppText>
                  <AppText variant="bodyBold" numberOfLines={2}>
                    {s.title}
                  </AppText>
                  <Gap size="xs" />
                  <SeriesDashes
                    total={sLen}
                    done={Math.min(sp.currentIndex, sLen)}
                    active={s.id === series.id && !completed}
                  />
                </View>
                <AppText variant="body" muted>
                  {completed ? '✓' : '›'}
                </AppText>
              </Pressable>
            );
          })}
          <Gap size="md" />
          <AppText variant="caption" muted>
            More series coming soon.
          </AppText>
        </View>
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
  heroScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(24,28,12,0.30)' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.line,
    paddingTop: space.sm,
    marginBottom: space.md,
  },
  card: {
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  cardCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(24,28,12,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.line,
  },
  thumb: { width: 64, height: 64, borderRadius: radius.sm, overflow: 'hidden' },
});
