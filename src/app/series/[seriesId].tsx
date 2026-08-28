/**
 * Series detail — Open's program page, in Contemplate's voice: full-bleed
 * gradient hero, editorial label, title, theme description, then the
 * contemplation list with progress dashes and hint chips. Prompts stay
 * hidden until completed (hard rule). Start + Share pinned LOW at the bottom.
 */
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { notify } from '@/components/Notice';
import { shareMessage } from '@/services/share';
import { SeriesArt } from '@/components/SeriesArt';
import { SeriesDashes } from '@/components/SeriesDashes';
import { AppText, Gap, Row, TextLink } from '@/components/ui';
import { chapterNumber, getSeries, seriesCode, seriesLength, SERIES_ONE } from '@/content/series';
import {
  dropLabel,
  hasActiveAccess,
  isDropAvailable,
  nextDropAt,
  isSeriesAtWrap,
  isSeriesCompleted,
  isSeriesUnlocked,
  progressFor,
} from '@/services/logic';
import { useApp } from '@/services/provider';
import { color, radius, seriesPalettes, space } from '@/theme/tokens';

const SHARE_URL = 'https://katkingston.github.io/contemplation-prototype/';

export default function SeriesDetail() {
  const { data } = useApp();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ seriesId?: string }>();
  const series = getSeries(params.seriesId ?? '');

  if (!series) {
    router.replace('/home');
    return null;
  }

  const p = progressFor(data, series.id);
  const len = seriesLength(series);
  const completed = isSeriesCompleted(data, series);
  const atWrap = isSeriesAtWrap(data, series);
  const unlocked = isSeriesUnlocked(data, series);
  const accessOk = hasActiveAccess(data, series.id);
  const dropReady = isDropAvailable(data, series.id);
  const dropAt = nextDropAt(data, series.id);
  const started = p.currentIndex > 0;

  // Button states per Kat: Continue / Chapter locked (grayed) / Come back ...
  const locked = !unlocked && !completed && !atWrap;
  const waiting = unlocked && !completed && !atWrap && !dropReady && accessOk;
  const cta = completed
    ? 'Revisit'
    : atWrap
      ? 'See your wrap-up'
      : locked
        ? 'Chapter locked'
        : waiting
          ? `Come back at ${dropAt ? dropLabel(dropAt) : 'the next drop'}`
          : started
            ? 'Continue'
            : 'Start';
  const ctaDisabled = locked || waiting;

  const onStart = () => {
    if (atWrap) {
      router.push({ pathname: '/series-wrap', params: { seriesId: series.id } });
      return;
    }
    if (completed) {
      router.push({ pathname: '/next-step', params: { seriesId: series.id } });
      return;
    }
    if (!accessOk) {
      router.push('/subscription');
      return;
    }
    if (!unlocked) {
      notify('Complete the current chapter first. This one unlocks after.');
      return;
    }
    if (!dropReady) {
      notify(
        `Today’s contemplation is done. A new one arrives at ${
          dropAt ? dropLabel(dropAt) : 'the next drop'
        }.`,
      );
      return;
    }
    if (p.currentIndex === 0) {
      router.push({ pathname: '/series-intro', params: { seriesId: series.id } });
    } else {
      router.push({
        pathname: '/get-ready',
        params: { seriesId: series.id, index: String(p.currentIndex) },
      });
    }
  };

  const onShare = () =>
    shareMessage(`${series.title}, a chapter of ${SERIES_ONE.title} on Contemplate. ${SHARE_URL}`);

  return (
    <SafeAreaView style={styles.shell} edges={['left', 'right']} testID="series-detail">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 140, paddingHorizontal: space.lg }}>
        {/* S2: square progress marks + n/len at 71, title 106, art 176 (160
            tall), meta 344, theme 371, then the rows from 451 on a 38 pitch. */}
        <View style={{ height: 71 }} />
        <Row between>
          <SeriesDashes
            total={len}
            done={Math.min(p.currentIndex, len)}
            active={!completed && !atWrap}
          />
          <AppText variant="label" muted>
            {`${Math.min(p.currentIndex, len)}/${len}`}
          </AppText>
        </Row>
        <View style={{ height: 16 }} />
        {/* S2 sets the chapter title over two lines; the fixed well keeps the
            art on 176 and the meta row on 344 for short titles too. */}
        <View style={{ height: 48 }}>
          <AppText variant="heading">{series.title}</AppText>
        </View>
        <View style={{ height: 22 }} />
        <View style={styles.hero}>
          <SeriesArt
            gradient={series.contemplations[0].gradient}
            accent={(seriesPalettes[series.id] ?? ['#232619', '#4c5232', '#6f7036'])[2]}
            seed={series.displayOrder}
            style={StyleSheet.absoluteFill as never}
          />
        </View>
        <View style={{ height: 8 }} />
        <Row between>
          <AppText variant="label" muted>
            {`${SERIES_ONE.title} · Chapter ${chapterNumber(series)}`}
          </AppText>
          <AppText variant="label" muted>
            {series.tag}
          </AppText>
        </Row>
        <View style={{ height: 8 }} />
        <AppText variant="small" muted>
          {series.theme}
        </AppText>
        <View style={{ height: 61 }} />
        {series.contemplations.map((c, i) => {
          const done = i < p.currentIndex;
          const isNext = i === p.currentIndex && !atWrap && !completed;
          // Colour logic (Kat, Aug 17): a row is live ONLY if it was already
          // completed, or it is today's contemplation and today's drop has
          // arrived on an unlocked, paid-for chapter. Everything else —
          // tomorrow's, future days, locked chapters — reads disabled.
          const available = done || (isNext && dropReady && unlocked && accessOk);
          return (
            // No contemplation copy here, done or not (Kat, Aug 17) — the
            // questions live only inside the practice itself.
            <View key={c.id} style={styles.row}>
              <View style={{ flex: 1, opacity: available ? 1 : 0.45 }}>
                <Row>
                  <AppText variant="label" muted style={styles.rowCode as never}>
                    {seriesCode(series, i)}
                  </AppText>
                  <AppText variant="bodyBold" muted={!available}>
                    {c.hint}
                  </AppText>
                </Row>
              </View>
              {done ? (
                <View style={styles.rowDotDone} />
              ) : available ? (
                <View style={styles.rowDotNext} />
              ) : null}
            </View>
          );
        })}
        <View style={styles.endRule} />
      </ScrollView>
      {/* Back / Share / Contemplate pinned low (Jul 30 designs). */}
      {/* S2 rests these on 758, a clear 65 above the frame's edge. */}
      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom + space.md, 65) }]}>
        <TextLink
          label="Back"
          muted
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
          testID="series-back"
        />
        <TextLink label="Share" muted onPress={onShare} testID="series-share" />
        <View style={{ flex: 1 }} />
        <TextLink
          label={cta}
          arrow={!ctaDisabled}
          disabled={ctaDisabled}
          onPress={onStart}
          testID="series-start"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: color.paper },
  hero: { height: 160, borderRadius: radius.sm, overflow: 'hidden' },
  row: {
    // 38pt pitch: one 15/21 line with 8.5 either side, ruled above. Rows that
    // reveal a completed prompt grow past it, by design.
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: 8.5,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.muted,
  },
  rowCode: { minWidth: 50 },
  rowDotDone: { width: 7, height: 7, borderRadius: 4, backgroundColor: color.ink },
  rowDotNext: {
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: color.ink,
  },
  endRule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.muted },
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    backgroundColor: color.paper,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.line,
  },
});
