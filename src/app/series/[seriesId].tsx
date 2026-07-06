/**
 * Series detail — Open's program page, in Contemplate's voice: full-bleed
 * gradient hero, editorial label, title, theme description, then the
 * contemplation list with progress dashes and hint chips. Prompts stay
 * hidden until completed (hard rule). Start + Share pinned LOW at the bottom.
 */
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { notify } from '@/components/Notice';
import { shareMessage } from '@/services/share';
import { SeriesArt } from '@/components/SeriesArt';
import { SeriesDashes } from '@/components/SeriesDashes';
import { AppText, Button, Gap, Row } from '@/components/ui';
import { getSeries, seriesLength } from '@/content/series';
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
        contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={styles.hero}>
          <SeriesArt
            gradient={series.contemplations[0].gradient}
            accent={(seriesPalettes[series.id] ?? ['#232619', '#4c5232', '#6f7036'])[2]}
            seed={series.displayOrder}
            style={StyleSheet.absoluteFill as never}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
            style={styles.back}
            testID="series-back">
            <AppText variant="heading" style={{ color: color.onDark }}>
              ←
            </AppText>
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: space.lg }}>
          <Gap size="lg" />
          <AppText variant="label" muted>
            {series.tag} · {len} contemplations
          </AppText>
          <Gap size="sm" />
          <AppText variant="title">{series.title}</AppText>
          <Gap size="md" />
          <SeriesDashes total={len} done={p.currentIndex} active={!completed && !atWrap} />
          <Gap size="md" />
          <AppText variant="body" muted>
            {series.theme}
          </AppText>
          <Gap size="xl" />
          {series.contemplations.map((c, i) => {
            const done = i < p.currentIndex;
            const today = i === p.currentIndex && !atWrap && !completed;
            return (
              <View key={c.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Row>
                    <AppText variant="bodyBold" muted={!done && !today}>
                      No. {i + 1}
                    </AppText>
                    <View style={[styles.chip, today && { borderColor: color.accent }]}>
                      <AppText variant="label" muted={!today} style={today ? { color: color.accent } : undefined}>
                        {c.hint}
                      </AppText>
                    </View>
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
                <AppText variant="small" muted>
                  {done ? '✓' : today ? '·' : ''}
                </AppText>
              </View>
            );
          })}
        </View>
      </ScrollView>
      {/* Start + Share pinned low, per reference */}
      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share this series"
          hitSlop={8}
          onPress={onShare}
          style={styles.shareCircle}
          testID="series-share">
          <AppText variant="heading">⌃</AppText>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Button
            label={cta}
            arrow={!ctaDisabled}
            disabled={ctaDisabled}
            onPress={onStart}
            testID="series-start"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: color.paper },
  hero: { height: 300 },
  back: {
    position: 'absolute',
    top: space.md,
    left: space.lg,
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.line,
  },
  chip: {
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
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
  shareCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: color.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
