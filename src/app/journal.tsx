/**
 * C6 — Journal / Thought Diary.
 * Saved immediately, hidden until series completion. 150-word + 60s caps.
 * Instructions behind a small button (top, next to Crisis). One exit control.
 */
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { VoiceRecorder, WordCapInput, countWords } from '@/components/diary';
import { AppText, Gap, MonoHeader, Row, Screen, Sheet, Spacer, TextLink } from '@/components/ui';
import { journalHelp } from '@/content/copy';
import { getSeries, seriesCode, seriesLength } from '@/content/series';
import { questionFor } from '@/services/logic';
import { useApp } from '@/services/provider';
import { color, radius, space } from '@/theme/tokens';

export default function Journal() {
  const { data, act } = useApp();
  const params = useLocalSearchParams<{
    seriesId?: string;
    index?: string;
    totalSeconds?: string;
    redo?: string;
  }>();
  const isRedo = params.redo === '1';
  const series = getSeries(params.seriesId ?? '');
  const index = Number(params.index ?? '0') || 0;
  const totalSeconds = Number(params.totalSeconds ?? '0') || 0;

  const [text, setText] = useState('');
  const [audio, setAudio] = useState<{ uri: string | null; sec: number }>({ uri: null, sec: 0 });
  const [showHelp, setShowHelp] = useState(false);

  const prompt = series ? questionFor(data, series, index) : '';

  // On repeat: show the prior reflection for this contemplation.
  const prior = useMemo(() => {
    if (!series) return null;
    const cid = series.contemplations[index]?.id;
    const matches = data.diary.filter((e) => e.contemplationId === cid);
    return matches.length > 0 ? matches[matches.length - 1] : null;
  }, [data.diary, series, index]);

  if (!series || !series.contemplations[index]) {
    router.replace('/home');
    return null;
  }
  const contemplation = series.contemplations[index];

  const finishDay = async (saveEntry: boolean) => {
    const ok = await act(async (s) => {
      if (saveEntry && (countWords(text) > 0 || audio.uri)) {
        await s.saveDiaryEntry({
          seriesId: series.id,
          contemplationId: contemplation.id,
          prompt,
          text: countWords(text) > 0 ? text.trim() : null,
          audioUri: audio.uri,
          audioDurationSec: audio.uri ? audio.sec : null,
        });
      }
      // A redo revisits an already-recorded contemplation — recording again
      // would advance currentIndex past reality.
      if (!isRedo) {
        await s.recordContemplationComplete(series.id, contemplation.id, totalSeconds);
      }
    });
    if (!ok) return; // never advance past a lost reflection — banner explains
    if (isRedo) {
      router.replace({
        pathname: '/day-exit',
        params: { seriesId: series.id, index: String(index) },
      });
      return;
    }
    // Last contemplation of the series → wrap-up; otherwise day exit.
    const willBeIndex = index + 1;
    if (willBeIndex >= seriesLength(series)) {
      router.replace({ pathname: '/series-wrap', params: { seriesId: series.id } });
    } else {
      router.replace({
        pathname: '/day-exit',
        params: { seriesId: series.id, index: String(index) },
      });
    }
  };

  return (
    <Screen testID="journal-screen">
      <Gap size="md" />
      <MonoHeader code={seriesCode(series, index)} title={contemplation.hint} />
      <Gap size="xl" />
      <Row between>
        <AppText variant="titleLower">Reflect</AppText>
        <TextLink label="Instructions" muted onPress={() => setShowHelp(true)} />
      </Row>
      <Gap size="xs" />
      <AppText variant="small" muted>
        {prompt}
      </AppText>
      {prior && (
        <View
          style={{
            marginTop: space.md,
            padding: space.md,
            backgroundColor: color.faint,
            borderRadius: radius.sm,
          }}>
          <AppText variant="caption" muted>
            Your previous reflection
          </AppText>
          <AppText variant="small">{prior.text ?? '(voice memo)'}</AppText>
        </View>
      )}
      <Gap size="xl" />
      <WordCapInput value={text} onChange={setText} />
      <Gap size="xl" />
      <VoiceRecorder onRecorded={(uri, sec) => setAudio({ uri, sec })} />
      <Spacer />
      <Gap size="xl" />
      <Row style={{ gap: space.md }}>
        <TextLink label="Skip," muted onPress={() => finishDay(false)} testID="journal-skip" />
        <TextLink label="Submit" onPress={() => finishDay(true)} testID="journal-submit" />
      </Row>
      <Gap size="md" />
      <AppText variant="caption" muted>
        Reflections are saved privately and revealed when you complete the series.
      </AppText>
      <Sheet visible={showHelp} onClose={() => setShowHelp(false)} title={journalHelp.title}>
        {journalHelp.paragraphs.map((p, i) => (
          <AppText key={i} variant="body" style={{ marginBottom: space.sm }}>
            {p}
          </AppText>
        ))}
      </Sheet>
    </Screen>
  );
}
