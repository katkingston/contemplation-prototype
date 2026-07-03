/**
 * C5 — Add Time / Journal. Shown when the contemplation ends.
 * Tapping a time chip restarts the contemplation immediately (video restarts);
 * "Continue to Journal" moves on.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CrisisButton } from '@/components/CrisisButton';
import { AppText, Button, Gap } from '@/components/ui';
import { getSeries } from '@/content/series';
import { color, radius, space, timing } from '@/theme/tokens';

export default function AddTime() {
  const params = useLocalSearchParams<{
    seriesId?: string;
    index?: string;
    music?: string;
    totalSeconds?: string;
  }>();
  const series = getSeries(params.seriesId ?? '');
  const index = Number(params.index ?? '0') || 0;
  const totalSeconds = Number(params.totalSeconds ?? '0') || 0;
  const c = series?.contemplations[index];

  if (!series || !c) {
    router.replace('/home');
    return null;
  }

  const addTime = (minutes: number) => {
    // Restarts the contemplation (and its video) automatically.
    router.replace({
      pathname: '/contemplation',
      params: {
        seriesId: series.id,
        index: String(index),
        minutes: String(minutes),
        music: params.music ?? '1',
        carrySeconds: String(totalSeconds),
      },
    });
  };

  const toJournal = () =>
    router.replace({
      pathname: '/journal',
      params: { seriesId: series.id, index: String(index), totalSeconds: String(totalSeconds) },
    });

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[c.gradient[0], c.gradient[1]]}
        style={[StyleSheet.absoluteFill, { opacity: 0.45 }]}
      />
      <SafeAreaView style={styles.content}>
        <View style={{ alignItems: 'flex-end', paddingTop: space.sm }}>
          <CrisisButton dim />
        </View>
        <View style={{ flex: 1 }} />
        <AppText variant="title" dark>
          Add Time
        </AppText>
        <Gap size="md" />
        <View style={styles.chips}>
          {timing.addTimeChoicesMin.map((m) => (
            <Pressable
              key={m}
              accessibilityRole="button"
              onPress={() => addTime(m)}
              style={styles.chip}
              testID={`add-time-${m}`}>
              <AppText variant="small" style={{ color: '#efe9db' }}>
                +{m} min
              </AppText>
            </Pressable>
          ))}
        </View>
        <Gap size="sm" />
        <AppText variant="caption" dark muted>
          Tapping a time restarts the contemplation automatically.
        </AppText>
        <Gap size="lg" />
        <Button label="Continue to Journal" dark onPress={toJournal} testID="to-journal" />
        <Gap size="lg" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.dark },
  content: { flex: 1, paddingHorizontal: space.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(239,233,219,0.5)',
  },
});
