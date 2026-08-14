/**
 * C1 — Home, Open-Discover style: artwork-led. The today hero REVEALS
 * NOTHING (series, number, hint only — the question appears only inside the
 * contemplation). Below: a horizontal artwork rail for the active series and
 * image-led rows for all series. Section headers carry SEE ALL links.
 */
import { useIsFocused } from '@react-navigation/native';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '@/components/BottomNav';
import { SeriesArt } from '@/components/SeriesArt';
import { SeriesDashes } from '@/components/SeriesDashes';
import { AppText, Gap } from '@/components/ui';
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

const HERO_VIDEO = require('../../assets/media/contemplation-loop.mp4');
/** The hero loops only the FIRST 5 seconds of the day's footage. */
const HERO_LOOP_SECONDS = 5;

function HeroVideo({ focused }: { focused: boolean }) {
  const player = useVideoPlayer(HERO_VIDEO, (p) => {
    p.loop = true;
    p.muted = true;
    p.timeUpdateEventInterval = 0.25;
    p.play();
  });
  // Belt and braces with the focus unmount: never let a blurred screen play.
  useEffect(() => {
    if (focused) player.play();
    else player.pause();
  }, [focused, player]);
  useEffect(() => {
    player.play(); // setup callback can fire before the element is ready (web)
    const sub = player.addListener('timeUpdate', (e) => {
      if (e.currentTime >= HERO_LOOP_SECONDS) player.currentTime = 0;
    });
    return () => sub.remove();
  }, [player]);
  // iPhone Safari: force inline playback so the loop never goes fullscreen.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const force = () => {
      document.querySelectorAll('video').forEach((v) => {
        v.setAttribute('playsinline', 'true');
        v.setAttribute('webkit-playsinline', 'true');
        v.muted = true;
        // Safari won't clip <video> to a rounded overflow-hidden parent; it
        // paints over everything. Clip the element itself.
        v.style.borderRadius = '3px';
        v.style.clipPath = 'inset(0 round 3px)';
        v.style.objectFit = 'cover';
        v.style.width = '100%';
        v.style.height = '100%';
        (v.style as CSSStyleDeclaration & { webkitClipPath?: string }).webkitClipPath =
          'inset(0 round 3px)';
      });
    };
    const id = setInterval(force, 500);
    const stop = setTimeout(() => clearInterval(id), 4000);
    return () => {
      clearInterval(id);
      clearTimeout(stop);
    };
  }, []);
  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
      accessible={false}
      importantForAccessibility="no"
    />
  );
}

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
  const reducedMotion = useReducedMotion();
  // Home stays mounted beneath other routes (web keeps stack screens alive);
  // the video must unmount when unfocused or it bleeds through page changes.
  const isFocused = useIsFocused();
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

  // Done for today: show the COMPLETED contemplation with a note (never
  // tease tomorrow's hint early). Otherwise the hero is one big Start link.
  const doneToday = !atWrap && !dropReady && dropAt != null && p.currentIndex > 0;
  const shownIdx = doneToday ? p.currentIndex - 1 : idx;
  const shown = series.contemplations[shownIdx];

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

  // Jul 30 designs: done-today offers "Redo Contemplation" — replays the
  // completed item without re-recording progress (redo flag).
  const onRedo = () =>
    router.push({
      pathname: '/get-ready',
      params: { seriesId: series.id, index: String(shownIdx), redo: '1' },
    });

  const openSeries = (id: string) =>
    router.push({ pathname: '/series/[seriesId]', params: { seriesId: id } });

  return (
    <SafeAreaView style={styles.shell} edges={['top', 'left', 'right']} testID="home-screen">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}>
        <Gap size="md" />
        {/* Today hero — artwork-led. Done-today shows the completed item;
            otherwise the whole card is the Start link. */}
        <View style={{ paddingHorizontal: space.lg }}>
          <View style={[styles.hero, { height: heroHeight }]} testID="hero-play">
            <SeriesArt
              gradient={shown ? shown.gradient : ['#333', '#555']}
              accent={palette[2]}
              seed={shownIdx}
              style={StyleSheet.absoluteFill as never}
            />
            {/* Day's footage, 5s loop. Reduce Motion gets the still artwork.
                Rendered only while Home is focused — never during transitions. */}
            {!reducedMotion && isFocused && <HeroVideo focused={isFocused} />}
            <View style={styles.heroScrim} />
            {/* Jul 30 designs: "1/7"-style counter left (computed), series
                name caps right; done-today gets a small marker dot. */}
            <View style={styles.heroTop}>
              <AppText variant="label" style={{ color: 'rgba(251,251,246,0.85)' }}>
                {`${Math.min(shownIdx + 1, len)}/${len}`}
              </AppText>
              <View style={{ flex: 1 }} />
              <View style={{ alignItems: 'flex-end', maxWidth: '70%' }}>
                <AppText
                  variant="label"
                  style={{ color: 'rgba(251,251,246,0.85)', textAlign: 'right' }}>
                  {series.title}
                </AppText>
                {doneToday ? <View style={styles.doneDot} /> : null}
              </View>
            </View>
            <View style={{ flex: 1 }} />
            <AppText variant="heroTitle" style={{ color: color.onDark }}>
              {atWrap ? 'complete' : (shown?.hint ?? '').toLowerCase()}
            </AppText>
            <Gap size="lg" />
            {doneToday ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Redo today’s contemplation"
                onPress={onRedo}
                style={({ pressed }) => [
                  styles.heroButton,
                  styles.heroButtonMuted,
                  pressed && { opacity: 0.7 },
                ]}
                testID="hero-redo">
                <AppText variant="body" style={{ color: 'rgba(251,251,246,0.75)' }}>
                  Redo Contemplation
                </AppText>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  atWrap ? 'See your wrap-up' : 'Begin today’s contemplation'
                }
                onPress={onPlay}
                style={({ pressed }) => [styles.heroButton, pressed && { opacity: 0.7 }]}
                testID="hero-begin">
                <AppText variant="body" style={{ color: color.onDark }}>
                  {atWrap ? 'See your wrap-up' : 'Begin'}
                </AppText>
              </Pressable>
            )}
            {doneToday ? (
              <>
                <Gap size="sm" />
                <AppText variant="label" center style={{ color: 'rgba(251,251,246,0.7)', alignSelf: 'center' }}>
                  New contemplation at {dropLabel(dropAt!)}
                </AppText>
              </>
            ) : null}
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
            label={`${series.title} · ${Math.min(p.currentIndex, len)}/${len}`}
            onSeeAll={() => openSeries(series.id)}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.md }}>
          {series.contemplations.map((c, i) => {
            const done = i < p.currentIndex;
            const isNext = i === p.currentIndex && !atWrap;
            // 'Today' only while the drop is actually available — after
            // completing, the next one is tomorrow and reads (and dims) so.
            const today = isNext && dropReady;
            const tomorrow = isNext && !dropReady;
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
                  {done ? <View style={styles.cardDoneDot} /> : null}
                </View>
                <Gap size="sm" />
                <AppText variant="label" muted>
                  No. {i + 1}
                  {today ? ' · Today' : tomorrow ? ' · Tomorrow' : ''}
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
    borderRadius: radius.sm,
    overflow: 'hidden',
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
    alignItems: 'stretch',
  },
  heroScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(24,28,12,0.30)' },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  doneDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: color.onDark,
    marginTop: space.sm,
  },
  heroButton: {
    borderWidth: 1,
    borderColor: 'rgba(251,251,246,0.9)',
    borderRadius: radius.sm,
    paddingVertical: 13,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  heroButtonMuted: { borderColor: 'rgba(251,251,246,0.45)' },
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
  cardDoneDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: color.onDark,
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
