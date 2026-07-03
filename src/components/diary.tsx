/**
 * Diary inputs — 150-word capped text and ≤60s voice memo (expo-audio).
 * Both caps enforced in the UI per App-CLAUDE.md. Voice gracefully hides on
 * platforms without recording support (e.g. some web browsers).
 */
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
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

/** Trim text to the word cap (keeps any trailing space the user just typed off). */
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
      <AppText variant="small" muted>
        Write your thoughts
      </AppText>
      <Gap size="xs" />
      <TextInput
        multiline
        value={value}
        onChangeText={(t) => onChange(capWords(t, limits.diaryMaxWords))}
        placeholder="There are no right answers…"
        placeholderTextColor={color.muted}
        style={{
          ...type.body,
          minHeight: 140,
          borderWidth: 1,
          borderColor: atCap ? color.danger : color.line,
          borderRadius: radius.md,
          padding: space.md,
          backgroundColor: color.faint,
          textAlignVertical: 'top',
          color: color.ink,
        }}
        testID="diary-text"
      />
      <Gap size="xs" />
      <AppText variant="caption" muted style={{ textAlign: 'right', color: atCap ? color.danger : color.muted }}>
        {words} / {limits.diaryMaxWords} words{atCap ? ' — limit reached' : ''}
      </AppText>
    </View>
  );
}

export function VoiceRecorder({
  onRecorded,
}: {
  onRecorded: (uri: string | null, durationSec: number) => void;
}) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder, 500);
  const [permission, setPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [seconds, setSeconds] = useState(0);
  const [doneUri, setDoneUri] = useState<string | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

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
      setDoneUri(null);
      tickRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= limits.voiceMaxSeconds) {
            void stop(s + 1);
          }
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
    try {
      await recorder.stop();
      const uri = recorder.uri ?? null;
      setDoneUri(uri);
      onRecorded(uri, finalSeconds ?? seconds);
    } catch {
      onRecorded(null, 0);
    }
  };

  // Recording unsupported in some web browsers — hide rather than break.
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.mediaDevices) {
    return (
      <AppText variant="caption" muted>
        Voice memos are available in the mobile app.
      </AppText>
    );
  }

  const recording = state.isRecording;

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: color.line,
        borderRadius: radius.pill,
        paddingVertical: space.sm,
        paddingHorizontal: space.md,
        backgroundColor: color.faint,
      }}>
      <Row between>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={recording ? 'Stop recording' : 'Record a voice memo'}
          onPress={recording ? () => stop() : start}
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: recording ? color.ink : color.danger,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          testID="voice-record">
          <AppText variant="small" style={{ color: '#efe9db' }}>
            {recording ? '■' : '●'}
          </AppText>
        </Pressable>
        <AppText variant="small" muted>
          {recording
            ? `Recording… ${seconds}s / ${limits.voiceMaxSeconds}s`
            : doneUri
              ? `Voice memo saved (${seconds}s)`
              : permission === 'denied'
                ? 'Microphone unavailable'
                : `Voice memo · up to ${limits.voiceMaxSeconds}s`}
        </AppText>
      </Row>
    </View>
  );
}
