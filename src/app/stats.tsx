/** S2 — Series Completion Celebration Stats: real data + revealed thoughts. */
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { AppText, Button, Gap, Screen } from '@/components/ui';
import { getSeries } from '@/content/series';
import { formatMinutes, statsFor } from '@/services/logic';
import { useApp } from '@/services/provider';
import { color, radius, space } from '@/theme/tokens';

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 130,
        padding: space.md,
        borderRadius: radius.md,
        backgroundColor: color.faint,
        borderWidth: 1,
        borderColor: color.line,
      }}>
      <AppText variant="title">{value}</AppText>
      <AppText variant="caption" muted>
        {label}
      </AppText>
    </View>
  );
}

export default function Stats() {
  const { data } = useApp();
  const params = useLocalSearchParams<{ seriesId?: string }>();
  const seriesId = params.seriesId ?? '';
  const series = getSeries(seriesId);
  const stats = statsFor(data, seriesId);

  if (!series) {
    router.replace('/home');
    return null;
  }

  return (
    <Screen testID="stats-screen">
      <Gap size="xl" />
      <AppText variant="title">Look how far you came</AppText>
      <Gap size="lg" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        <Stat value={formatMinutes(stats.totalSeconds)} label="time contemplating" />
        <Stat value={String(stats.thoughtsShared)} label="thoughts shared" />
        <Stat value={`${stats.daysComplete}/${stats.seriesLength}`} label="contemplations complete" />
        <Stat value={`🔥 ${stats.streak}`} label="day streak" />
      </View>
      <Gap size="lg" />
      <AppText variant="heading">A few of your thoughts</AppText>
      <Gap size="sm" />
      {stats.revealedEntries.length === 0 ? (
        <AppText variant="small" muted>
          You kept your reflections to quiet sitting this series — that counts too.
        </AppText>
      ) : (
        stats.revealedEntries.map((e, i) => (
          <View
            key={i}
            style={{
              padding: space.md,
              borderRadius: radius.md,
              backgroundColor: color.faint,
              borderWidth: 1,
              borderColor: color.line,
              marginBottom: space.sm,
            }}>
            <AppText variant="caption" muted>
              {e.prompt}
            </AppText>
            <Gap size="xs" />
            <AppText variant="small">{e.text ?? '🎙 Voice memo'}</AppText>
          </View>
        ))
      )}
      <Gap size="md" />
      <AppText variant="body" muted>
        Taking time to sit with what matters is a practice — and you practiced.
      </AppText>
      <Gap size="xl" />
      <Button
        label="Continue"
        onPress={() => router.replace({ pathname: '/survey', params: { seriesId } })}
        testID="stats-continue"
      />
      <Gap size="sm" />
      <Button label="Close" kind="ghost" onPress={() => router.replace('/home')} />
    </Screen>
  );
}
