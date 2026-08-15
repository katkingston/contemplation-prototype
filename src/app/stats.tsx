/** S2 — Series Completion Celebration Stats: real data + revealed thoughts. */
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { MemoPlayer } from '@/components/diary';
import { AppText, Button, Gap, Screen } from '@/components/ui';
import { getSeries } from '@/content/series';
import { formatMinutes, seriesTotals } from '@/services/logic';
import { useApp } from '@/services/provider';
import { anchor, color, font, space } from '@/theme/tokens';

/** Same stat setting as S4/Journey: 36/44 mono numeral over an 11px label. */
function Stat({ value, label, wide = false }: { value: string; label: string; wide?: boolean }) {
  return (
    <View style={wide ? { width: 182, paddingRight: space.md } : { flex: 1 }}>
      <AppText style={{ fontFamily: font.mono, fontSize: 36, lineHeight: 44, color: color.ink } as never}>
        {value}
      </AppText>
      <AppText variant="caption" muted style={{ marginTop: 4 }}>
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
  // End-of-series page: totals span every chapter, not just the last one.
  const stats = seriesTotals(data);

  if (!series) {
    router.replace('/home');
    return null;
  }

  return (
    <Screen testID="stats-screen" top={anchor.pageTitle}>
      <AppText variant="titleLower">Look how far you came</AppText>
      <View style={{ height: 82 }} />
      <View style={{ flexDirection: 'row' }}>
        <Stat wide value={formatMinutes(stats.totalSeconds)} label="time contemplating" />
        <Stat value={String(stats.thoughtsShared)} label="thoughts shared" />
      </View>
      <View style={{ height: 34 }} />
      <View style={{ flexDirection: 'row' }}>
        <Stat wide value={`${stats.daysComplete}/${stats.seriesLength}`} label="contemplations complete" />
        <Stat value={String(stats.streak)} label="day streak" />
      </View>
      <View style={{ height: 60 }} />
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
              paddingVertical: space.md,
              borderTopWidth: 1,
              borderTopColor: color.line,
              borderStyle: 'dotted',
            }}>
            <AppText variant="caption" muted>
              {e.prompt}
            </AppText>
            <Gap size="xs" />
            {e.text ? <AppText variant="small">{e.text}</AppText> : null}
            {e.audioUri ? (
              <>
                <Gap size="xs" />
                <MemoPlayer uri={e.audioUri} />
              </>
            ) : null}
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
