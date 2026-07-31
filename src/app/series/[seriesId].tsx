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
import { getSeries, seriesCode, seriesLength } from '@/content/series';
import {
  dropLabel,
  hasActiveAccess,
  isDropAvailable,
  nextDropAt,
  isSeriesAtWrap,
  isSeriesCompleted,
  isSeriesUnlocked,
  progressFor,
  questionFor,
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

  // Button states per Kat: Continue / Series locked (grayed) / Come back ...
  const locked = !unlocked && !completed && !atWrap;
  const waiting = unlocked && !completed && !atWrap && !dropReady && accessOk;
  const cta = completed
    ? 'Revisit'
    : atWrap
      ? 'See your wrap-up'
      : locked
        ? 'Series locked'
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
      notify('Complete the current series first. This one unlocks after.');
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
    shareMessage(`${series.title}, a contemplation series on Contemplate. ${SHARE_URL}`);

  return (
    <SafeAreaView style={styles.shell} edges={['top', 'left', 'right']} testID="series-detail">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 140, paddingHorizontal: space.lg }}>
        <Gap size="md" />
        {/* Jul 30 designs: dot progress top-left, computed n/len top-right. */}
        <Row between>
          <SeriesDashes total={len} done={Math.min(p.currentIndex, len)} active={!completed && !atWrap} />
          <AppText variant="label" muted>
            {`${Math.min(p.currentIndex, len)}/${len}`}
          </AppText>
        </Row>
        <Gap size="md" />
        <AppText variant="titleLower">{series.title}</AppText>
        <Gap size="md" />
        <View style={styles.hero}>
          <SeriesArt
            gradient={series.contemplations[0].gradient}
            accent={(seriesPalettes[series.id] ?? ['#232619', '#4c5232', '#6f7036'])[2]}
            seed={series.displayOrder}
            style={StyleSheet.absoluteFill as never}
          />
        </View>
        <Gap size="sm" />
        <Row between>
          <AppText variant="label" muted>
            {`Series ${seriesCode(series, 0).split('.')[0]}`}
          </AppText>
          <AppText variant="label" muted>
            {series.tag}
          </AppText>
        </Row>
        <Gap size="sm" />
        <AppText variant="small" muted>
          {series.theme}
        </AppText>
        <Gap size="xl" />
        {series.contemplations.map((c, i) => {
          const done = i < p.currentIndex;
          const isNext = i === p.currentIndex && !atWrap && !completed;
          const today = isNext && dropReady;
          const future = !done && !isNext;
          return (
            <View key={c.id} style={styles.row}>
              <View style={{ flex: 1, opacity: future ? 0.45 : 1 }}>
                <Row>
                  <AppText variant="label" muted style={styles.rowCode as never}>
                    {seriesCode(series, i)}
                  </AppText>
                  <AppText variant="bodyBold" muted={future}>
                    {c.hint}
                  </AppText>
                </Row>
                {done ? (
                  <>
                    <Gap size="xs" />
                    <AppText variant="small" muted>
                      {questionFor(data, series, i)}
                    </AppText>
                  </>
                ) : null}
              </View>
              {done ? (
                <View style={styles.rowDotDone} />
              ) : isNext ? (
                <View style={styles.rowDotNext} />
              ) : null}
            </View>
          );
        })}
        <View style={styles.endRule} />
      </ScrollView>
      {/* Back / Share / Contemplate pinned low (Jul 30 designs). */}
      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
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
  hero: { height: 220, borderRadius: radius.sm, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.muted,
  },
  rowCode: { minWidth: 44 },
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
