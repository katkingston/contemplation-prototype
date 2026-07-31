/**
 * Get Ready to Contemplate — precedes EVERY contemplation (free taste included).
 * Jul 30 designs: full-bleed series gradient, mono "get ready to contemplate",
 * big lowercase title (the contemplation hint), then "Add time" and
 * "Select music" rows of mono options with the selection underlined.
 * Two versions (per Kat, July 2026):
 *  - App-open (start of a session): mono header (code — hint + date) and
 *    progress dots; footer pairs "Exit to homepage, Begin".
 *  - First-run/minimal: spiral glyph up top, footer is just "Begin".
 * Instructions stay behind a pop-up. No crisis button here (it remains on the
 * contemplation player). The Begin tap IS the required timer confirmation.
 */
import { Asset } from 'expo-asset';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PLACEHOLDER_VIDEO } from '@/components/Player';
import { SeriesDashes } from '@/components/SeriesDashes';
import { AppText, Gap, MonoHeader, Row, Sheet, Spacer, TextLink } from '@/components/ui';
import { instructions } from '@/content/copy';
import { useApp } from '@/services/provider';
import { color, font, seriesPalettes, space, timing } from '@/theme/tokens';

/**
 * Named ambience tracks (Jul 30 designs). All three named tracks currently
 * map to the same placeholder asset — the registry is the seam for real
 * audio; 'none' means silence.
 */
export const MUSIC_TRACKS = ['none', 'floating', 'studio', 'nature'] as const;
export type MusicTrack = (typeof MUSIC_TRACKS)[number];

export function InstructionsContent() {
  return (
    <View>
      <AppText variant="body" style={{ marginBottom: space.md }}>
        {instructions.intro}
      </AppText>
      {instructions.steps.map((s, i) => (
        <AppText key={i} variant="body" style={{ marginBottom: space.sm }}>
          {i + 1}. {s}
        </AppText>
      ))}
      <AppText variant="body" style={{ marginTop: space.sm }}>
        {instructions.outro}
      </AppText>
    </View>
  );
}

export interface GetReadySeriesContext {
  tag: string;
  title: string;
  number: number;
  hint: string;
  done: number;
  total: number;
  /** Editorial sequence code ("01.6") — compute via seriesCode(), never hardcode. */
  code?: string;
  /** Ambient gradient for this series (seriesPalettes entry). */
  gradient?: readonly [string, string, string];
}

/** A row of mono options; the selected one is underlined (Jul 30 designs). */
export function MonoOptionRow<T extends string | number>({
  options,
  value,
  onChange,
  labels,
  testID,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labels?: (v: T) => string;
  testID?: string;
}) {
  return (
    <View style={styles.optionRow} testID={testID}>
      {options.map((opt) => {
        const sel = opt === value;
        return (
          <Pressable
            key={String(opt)}
            accessibilityRole="button"
            accessibilityState={{ selected: sel }}
            onPress={() => onChange(opt)}
            hitSlop={8}
            testID={testID ? `${testID}-${String(opt)}` : undefined}>
            <Text
              style={[
                styles.option,
                sel && { color: color.onDark, textDecorationLine: 'underline' },
              ]}>
              {labels ? labels(opt) : String(opt)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function GetReadyScreen({
  onBegin,
  seriesContext,
  testID,
}: {
  onBegin: (minutes: number, musicOn: boolean) => void;
  /** App-open version: series info so the user knows what they're starting. */
  seriesContext?: GetReadySeriesContext;
  testID?: string;
}) {
  const { data } = useApp();
  const [minutes, setMinutes] = useState<number>(
    timing.timerChoicesMin.includes(data.settings.timerDefaultMin)
      ? data.settings.timerDefaultMin
      : timing.defaultTimerMin,
  );
  const [track, setTrack] = useState<MusicTrack>(
    data.settings.musicDefaultOn ? 'floating' : 'none',
  );
  const [showInstructions, setShowInstructions] = useState(false);

  const gradient = seriesContext?.gradient ?? seriesPalettes['s1-impermanence'];

  // Pre-warm the contemplation footage while the user chooses their time so
  // the player opens without a loading lag (browser/OS cache does the rest).
  useEffect(() => {
    Asset.fromModule(PLACEHOLDER_VIDEO as number)
      .downloadAsync()
      .catch(() => {}); // prefetch is best-effort, never block the flow
  }, []);

  return (
    <View style={{ flex: 1 }} testID={testID}>
      <LinearGradient
        colors={[gradient[0], gradient[1], gradient[2]]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.content}>
        <Gap size="md" />
        {seriesContext ? (
          <MonoHeader code={seriesContext.code} title={seriesContext.hint} dark>
            <SeriesDashes total={seriesContext.total} done={seriesContext.done} active dark />
          </MonoHeader>
        ) : (
          <AppText style={styles.spiral as never}>꩜</AppText>
        )}
        <Spacer />
        <AppText variant="monoBody" dark>
          get ready to{'\n'}contemplate
        </AppText>
        <Gap size="sm" />
        <AppText variant="displayLower" dark>
          {(seriesContext?.hint ?? 'a moment of stillness').toLowerCase()}
        </AppText>
        <Spacer />
        <AppText variant="caption" dark muted>
          Add time
        </AppText>
        <Gap size="sm" />
        <MonoOptionRow
          options={timing.timerChoicesMin}
          value={minutes}
          onChange={setMinutes}
          labels={(m) => `${m} min`}
          testID="select-time"
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
          testID="select-music"
        />
        <Gap size="lg" />
        <TextLink
          label="Instructions"
          dark
          muted
          onPress={() => setShowInstructions(true)}
          testID="instructions-button"
        />
        <Spacer />
        <Row style={{ gap: space.md }}>
          {seriesContext ? (
            <TextLink
              label="Exit to homepage,"
              dark
              muted
              onPress={() => router.replace('/home')}
              testID="go-home"
            />
          ) : null}
          <TextLink
            label="Begin"
            dark
            onPress={() => onBegin(minutes, track !== 'none')}
            testID="begin-button"
          />
        </Row>
        <Gap size="lg" />
      </SafeAreaView>
      <Sheet
        visible={showInstructions}
        onClose={() => setShowInstructions(false)}
        title={instructions.title}>
        <InstructionsContent />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: space.lg },
  spiral: { fontSize: 30, color: color.onDarkMuted, fontFamily: font.grotesk },
  optionRow: { flexDirection: 'row', gap: space.xl, flexWrap: 'wrap' },
  option: {
    fontFamily: font.mono,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.56,
    color: color.onDarkMuted,
  },
});
