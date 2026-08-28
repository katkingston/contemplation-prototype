/**
 * C1 — Home, Open-Discover style: artwork-led. The today hero REVEALS
 * NOTHING (series, number, hint only — the question appears only inside the
 * contemplation). Below: a horizontal artwork rail for the active series,
 * whose SEE ALL header links through to the full library.
 */
import { useIsFocused } from '@react-navigation/native';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '@/components/BottomNav';
import { MediaWash } from '@/components/Player';
import { SeriesArt } from '@/components/SeriesArt';
import { AppText, Gap } from '@/components/ui';
import { seriesLength } from '@/content/series';
import {
  activeSeries,
  dropLabel,
  hasActiveAccess,
  isDropAvailable,
  isSeriesAtWrap,
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
  // The static export (GitHub Pages) pre-renders with a 0x0 window and no
  // resize event ever corrects it after hydration — deriving sizes straight
  // from useWindowDimensions collapses the rail cards to zero width on the
  // live site (dev server is unaffected, which is how it slipped through).
  // Fall back to the design frame whenever the runtime reports nothing.
  const dims = useWindowDimensions();
  const windowWidth = dims.width || 390;
  const windowHeight = dims.height || 844;
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

  // C1 draws the hero card at 25 and 470 tall, and the rail cards 160x192.
  // Both stay clamped so a shorter phone doesn't push the rail off-screen.
  const heroHeight = Math.min(470, Math.max(320, windowHeight - 374));
  const cardW = Math.min(160, windowWidth * 0.41);

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
        <View style={{ height: 25 }} />
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
            {/* Same blur + series-tinted wash as Get Ready (MediaWash). */}
            <MediaWash tint={palette[0]} />
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
            {/* C1: title block closes at ~373, button opens at 429. */}
            <View style={{ height: 56 }} />
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
            {/* The drop time used to repeat here; C1 leaves the card on its
                button and the tab bar already carries "Next session …". */}
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

        {/* Active series — horizontal artwork rail (header 547, cards 585). */}
        <View style={{ height: 44 }} />
        <View style={{ paddingHorizontal: space.lg }}>
          <SectionHeader
            label={`${series.title} · ${Math.min(p.currentIndex, len)}/${len}`}
            onSeeAll={() => openSeries(series.id)}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: space.lg, gap: 23 }}>
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

        {/* The "All series" block lived here — removed per Kat (Aug 14).
            Every series is one tap away via the rail's SEE ALL → /library. */}
      </ScrollView>
      <BottomNav active="today" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: color.paper },
  hero: {
    // C1 sets the card's content 21 in from its edge (frame x=45).
    borderRadius: radius.sm,
    overflow: 'hidden',
    paddingVertical: 21,
    paddingHorizontal: 21,
    alignItems: 'stretch',
  },
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
    paddingVertical: 12, // 45 tall with a 21-line label (C1)
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
    marginBottom: 19, // rail cards open on 585
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
});
