/**
 * Diary inputs — 150-word capped text and ≤60s voice memo (expo-audio).
 * Voice memo: live soundwave while recording (mic metering when available),
 * then replay / delete / re-record. `MemoPlayer` is reused by the stats
 * screen to play revealed voice notes.
 */
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';
import { AppText, Gap, Row } from '@/components/ui';
import { color, limits, radius, space, type } from '@/theme/tokens';

export function countWords(text: string): number {
  const t = text.trim();
  return t.length === 0 ? 0 : t.split(/\s+/).length;
}

/** Trim text to the word cap. */
function capWords(text: string, max: number): string {
  const words = text.trimStart().split(/\s+/);
  if (words.length <= max) return text;
  return words.slice(0, max).join(' ');
}

export function WordCapInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (t: string) => void;
}) {
  const words = countWords(value);
  const atCap = words >= limits.diaryMaxWords;
  return (
    <View>
      <TextInput
        multiline
        accessibilityLabel="Write your thoughts"
        value={value}
        onChangeText={(t) => onChange(capWords(t, limits.diaryMaxWords))}
        placeholder="write here…"
        placeholderTextColor={color.muted}
        style={{
          // Jul 30 designs: open mono writing surface over a dotted rule.
          ...type.monoBody,
          minHeight: 120,
          textAlignVertical: 'top',
          color: color.ink,
        }}
        testID="diary-text"
      />
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: atCap ? color.danger : color.muted,
          borderStyle: 'dotted',
          marginTop: space.sm,
        }}
      />
      <Gap size="sm" />
      <AppText
        variant="label"
        muted
        style={atCap ? { color: color.danger } : undefined}>
        {words} / {limits.diaryMaxWords} words{atCap ? ' · limit reached' : ''}
      </AppText>
    </View>
  );
}

// ---------- Soundwave ----------

const BAR_COUNT = 28;

/** Maps recorder metering (dB, ~-60..0) to a 0..1 level. */
function meterToLevel(db: number | undefined): number {
  if (db == null || !isFinite(db)) return 0.25 + Math.random() * 0.5; // visual fallback
  const clamped = Math.max(-60, Math.min(0, db));
  return Math.max(0.08, (clamped + 60) / 60);
}

function Soundwave({ levels, tint = color.danger }: { levels: number[]; tint?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, height: 30, flex: 1 }}>
      {levels.map((l, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: Math.max(3, l * 30),
            borderRadius: 1,
            backgroundColor: tint,
            opacity: 0.9,
          }}
        />
      ))}
    </View>
  );
}

// ---------- Memo playback (also used on the stats screen) ----------

export function MemoPlayer({ uri, durationSec }: { uri: string; durationSec?: number | null }) {
  // Web blob: URLs die with the browser session — probe before offering play.
  const [available, setAvailable] = useState(true);
  useEffect(() => {
    if (Platform.OS === 'web' && uri.startsWith('blob:')) {
      fetch(uri)
        .then((r) => setAvailable(r.ok))
        .catch(() => setAvailable(false));
    }
  }, [uri]);

  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (status.didJustFinish) {
      player.pause();
      player.seekTo(0);
    }
  }, [status.didJustFinish, player]);

  const toggle = () => {
    if (status.playing) player.pause();
    else player.play();
  };

  if (!available) {
    return (
      <AppText variant="caption" muted>
        🎙 Voice memo (unavailable in this browser session)
      </AppText>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={status.playing ? 'Pause voice memo' : 'Play voice memo'}
      onPress={toggle}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: color.line,
        backgroundColor: color.faint,
      }}
      testID="memo-play">
      <AppText variant="bodyBold">{status.playing ? '❚❚' : '▶'}</AppText>
      <AppText variant="small" muted>
        Voice memo{durationSec ? ` · ${Math.round(durationSec)}s` : ''}
      </AppText>
    </Pressable>
  );
}

// ---------- Recorder ----------

type RecPhase = 'idle' | 'recording' | 'recorded';

export function VoiceRecorder({
  onRecorded,
}: {
  onRecorded: (uri: string | null, durationSec: number) => void;
}) {
  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  const recState = useAudioRecorderState(recorder, 120);
  const [phase, setPhase] = useState<RecPhase>('idle');
  const [permission, setPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [seconds, setSeconds] = useState(0);
  const [memo, setMemo] = useState<{ uri: string; sec: number } | null>(null);
  const [levels, setLevels] = useState<number[]>(Array(BAR_COUNT).fill(0.08));
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<RecPhase>('idle');
  phaseRef.current = phase;

  // Feed the soundwave from mic metering while recording.
  useEffect(() => {
    if (phase !== 'recording') return;
    setLevels((prev) => [...prev.slice(1), meterToLevel(recState.metering ?? undefined)]);
  }, [recState.metering, recState.durationMillis, phase]);

  useEffect(
    () => () => {
      if (tickRef.current) clearInterval(tickRef.current);
    },
    [],
  );

  const start = async () => {
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setPermission('denied');
        return;
      }
      setPermission('granted');
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setSeconds(0);
      setMemo(null);
      setLevels(Array(BAR_COUNT).fill(0.08));
      setPhase('recording');
      onRecorded(null, 0);
      tickRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= limits.voiceMaxSeconds) void stop(s + 1);
          return s + 1;
        });
      }, 1000);
    } catch {
      setPermission('denied');
    }
  };

  const stop = async (finalSeconds?: number) => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (phaseRef.current !== 'recording') return;
    try {
      await recorder.stop();
      const uri = recorder.uri ?? null;
      const sec = finalSeconds ?? seconds;
      if (uri) {
        setMemo({ uri, sec });
        setPhase('recorded');
        onRecorded(uri, sec);
      } else {
        setPhase('idle');
        onRecorded(null, 0);
      }
    } catch {
      setPhase('idle');
      onRecorded(null, 0);
    }
  };

  const remove = () => {
    setMemo(null);
    setSeconds(0);
    setPhase('idle');
    onRecorded(null, 0);
  };

  // Recording unsupported in some web browsers — hide rather than break.
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.mediaDevices) {
    return (
      <AppText variant="caption" muted>
        Voice memos are available in the mobile app.
      </AppText>
    );
  }

  return (
    // Jul 30 designs: an open row — ringed olive record dot + mono caption.
    <View style={{ gap: space.sm }}>
      {phase === 'idle' && (
        <Row between>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Record a voice memo"
            onPress={start}
            style={recordRing}
            testID="voice-record">
            <View style={recordDot} />
          </Pressable>
          <AppText variant="monoBody" muted style={{ flex: 1, fontSize: 13 }}>
            {permission === 'denied'
              ? 'Microphone unavailable'
              : `Record a voice memo · up to ${limits.voiceMaxSeconds}s`}
          </AppText>
        </Row>
      )}
      {phase === 'recording' && (
        <Row between>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Stop recording"
            onPress={() => stop()}
            style={recordBtn(color.ink)}
            testID="voice-stop">
            <AppText variant="small" style={{ color: '#fff' }}>
              ■
            </AppText>
          </Pressable>
          <Soundwave levels={levels} />
          <AppText variant="label" muted>
            {seconds}s / {limits.voiceMaxSeconds}s
          </AppText>
        </Row>
      )}
      {phase === 'recorded' && memo && (
        <View style={{ gap: space.sm }}>
          <MemoPlayer uri={memo.uri} durationSec={memo.sec} />
          <Row>
            <Pressable accessibilityRole="button" onPress={start} testID="voice-rerecord">
              <AppText variant="caption" style={{ color: color.accent, textDecorationLine: 'underline' }}>
                Re-record
              </AppText>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={remove} testID="voice-delete">
              <AppText variant="caption" style={{ color: color.danger, textDecorationLine: 'underline' }}>
                Delete
              </AppText>
            </Pressable>
          </Row>
        </View>
      )}
    </View>
  );
}

function recordBtn(bg: string) {
  return {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: bg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
}

/** Idle record affordance: thin ring with a solid olive core (Jul 30 designs). */
const recordRing = {
  width: 34,
  height: 34,
  borderRadius: 17,
  borderWidth: 1.5,
  borderColor: color.accent,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};
const recordDot = {
  width: 14,
  height: 14,
  borderRadius: 7,
  backgroundColor: color.accent,
};
