/**
 * C5 — "want to keep contemplating?" (Jul 30 designs). Shown when the timer
 * ends: mono header (code + hint + date), Add-time and Select-music mono
 * option rows, and a "Resume, Go to journal" link pair. Choosing Resume
 * restarts the contemplation with the selected time (and music choice).
 */
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dither } from '@/components/Dither';
import { MonoOptionRow, MUSIC_TRACKS, MusicTrack } from '@/components/GetReady';
import { AppText, Gap, MonoHeader, Row, Spacer, TextLink, useAnchor } from '@/components/ui';
import { getSeries, seriesCode } from '@/content/series';
import { anchor, color, space, timing } from '@/theme/tokens';

export default function AddTime() {
  const params = useLocalSearchParams<{
    seriesId?: string;
    index?: string;
    music?: string;
    totalSeconds?: string;
    redo?: string;
  }>();
  const series = getSeries(params.seriesId ?? '');
  const index = Number(params.index ?? '0') || 0;
  const totalSeconds = Number(params.totalSeconds ?? '0') || 0;
  const c = series?.contemplations[index];
  const [minutes, setMinutes] = useState<number>(timing.addTimeChoicesMin[2] ?? 3);
  const [track, setTrack] = useState<MusicTrack>(params.music === '0' ? 'none' : 'floating');
  const ax = useAnchor();

  if (!series || !c) {
    router.replace('/home');
    return null;
  }

  const resume = () => {
    // Restarts the contemplation (and its video) with the chosen time.
    router.replace({
      pathname: '/contemplation',
      params: {
        seriesId: series.id,
        index: String(index),
        minutes: String(minutes),
        music: track === 'none' ? '0' : '1',
        carrySeconds: String(totalSeconds),
        redo: params.redo ?? '0',
      },
    });
  };

  const toJournal = () =>
    router.replace({
      pathname: '/journal',
      params: {
        seriesId: series.id,
        index: String(index),
        totalSeconds: String(totalSeconds),
        redo: params.redo ?? '0',
      },
    });

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[c.gradient[0], c.gradient[1]]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />
      <Dither />
      <SafeAreaView style={styles.content}>
        <View style={{ height: ax(anchor.monoHeader) }} />
        <MonoHeader code={seriesCode(series, index)} title={c.hint} dark />
        <View style={{ height: ax(anchor.lead) - ax(anchor.monoHeader) - 19 }} />
        <AppText variant="monoBody" dark>
          want to keep{'\n'}contemplating?
        </AppText>
        <View style={{ height: ax(anchor.optionLabelA) - ax(anchor.lead) - 45 }} />
        <AppText variant="caption" dark muted>
          Add time
        </AppText>
        <Gap size="sm" />
        <MonoOptionRow
          options={timing.addTimeChoicesMin}
          value={minutes}
          onChange={setMinutes}
          labels={(m) => `${m} min`}
          testID="add-time"
        />
        <Gap size="lg" />
        <AppText variant="caption" dark muted>
          Select music
        </AppText>
        <Gap size="sm" />
        <MonoOptionRow
          options={MUSIC_TRACKS}
          value={track}
          onChange={setTrack}
          testID="add-time-music"
        />
        <Spacer />
        <Row style={{ gap: space.md }}>
          <TextLink label="Resume," dark onPress={resume} testID="resume-with-time" />
          <TextLink label="Go to journal" dark muted onPress={toJournal} testID="to-journal" />
        </Row>
        <Gap size="lg" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.dark },
  content: { flex: 1, paddingHorizontal: space.lg },
});
