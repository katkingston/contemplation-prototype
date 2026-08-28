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
 * Begin then runs a 5..1 countdown (Kat, Aug 17): the page chrome fades away
 * (the wash and blur stay), the numbers surface centred over the filtered
 * footage at the contemplation copy's own size, ambient music opens with the
 * count, and the whole thing fades into the contemplation's dark ground
 * before the player takes over.
 */
import { Asset } from 'expo-asset';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MediaWash, PLACEHOLDER_VIDEO, VideoBackground } from '@/components/Player';
import { Dither } from '@/components/Dither';
import { SeriesDashes } from '@/components/SeriesDashes';
import { AppText, Gap, MonoHeader, Row, Sheet, TextLink } from '@/components/ui';
import { instructions } from '@/content/copy';
import { pauseAmbient, playAmbient } from '@/services/ambient';
import { useApp } from '@/services/provider';
import { anchor, color, font, seriesPalettes, space, timing, type } from '@/theme/tokens';

/**
 * Named ambience tracks (Jul 30 designs). All three named tracks currently
 * map to the same placeholder asset — the registry is the seam for real
 * audio; 'none' means silence.
 */
export const MUSIC_TRACKS = ['none', 'floating', 'studio', 'nature'] as const;
export type MusicTrack = (typeof MUSIC_TRACKS)[number];

export function InstructionsContent({ dark = false }: { dark?: boolean }) {
  return (
    <View>
      <AppText variant="body" dark={dark} style={{ marginBottom: space.md }}>
        {instructions.intro}
      </AppText>
      {instructions.steps.map((s, i) => (
        <AppText key={i} variant="body" dark={dark} style={{ marginBottom: space.sm }}>
          {i + 1}. {s}
        </AppText>
      ))}
      <AppText variant="body" dark={dark} style={{ marginTop: space.sm }}>
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

  // --- Begin → countdown (Kat, Aug 17): everything but the footage fades
  // away, 5..1 counts down centred over the naked video, then video and
  // number fade into the contemplation's flat dark ground. The player opens
  // on that same ground, so the seam is invisible.
  const reducedMotion = useReducedMotion();
  const [counting, setCounting] = useState(false);
  const [count, setCount] = useState(5);
  const uiOut = useSharedValue(1); // 1 = page chrome visible
  const numIn = useSharedValue(0); // per-number entrance/exit
  const cover = useSharedValue(0); // final fade to the player's ground
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const begin = () => {
    if (counting) return;
    setCounting(true);
    setCount(5);
    // Music opens WITH the countdown (Kat, Aug 17) and runs unbroken into
    // the contemplation — same shared player, no restart at the seam.
    if (track !== 'none') playAmbient();
    uiOut.value = reducedMotion ? 0 : withTiming(0, { duration: 450, easing: Easing.out(Easing.quad) });
    let n = 5;
    const tick = () => {
      if (n > 1) {
        n -= 1;
        setCount(n);
        timers.current.push(setTimeout(tick, 1000));
      } else {
        // "1" has had its second — fade video + number into the dark ground.
        cover.value = reducedMotion
          ? 1
          : withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) });
        timers.current.push(
          setTimeout(() => onBegin(minutes, track !== 'none'), reducedMotion ? 50 : 650),
        );
      }
    };
    timers.current.push(setTimeout(tick, 1000));
  };

  // Each number rises in and then HOLDS its whole beat — the next number's
  // own entrance is the beat change. (A fade-out tail left visible gaps
  // whenever a tick lagged, and the number must stay readable over bright
  // footage the whole second.)
  useEffect(() => {
    if (!counting) return;
    if (reducedMotion) {
      numIn.value = 1;
      return;
    }
    numIn.value = 0;
    numIn.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, counting, reducedMotion]);

  // Coming BACK to this screen (push keeps it mounted): restore the chrome,
  // silence any countdown music, and cancel pending countdown timers so a
  // stale one can't re-navigate. (Pause on FOCUS, not blur — on blur the
  // player has just taken the music over.)
  useFocusEffect(
    useCallback(() => {
      pauseAmbient();
      setCounting(false);
      setCount(5);
      uiOut.value = 1;
      numIn.value = 0;
      cover.value = 0;
      return () => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // Opacity only, everywhere (Kat, Aug 17) — nothing slides, it all surfaces.
  const uiStyle = useAnimatedStyle(() => ({ opacity: uiOut.value }));
  const numStyle = useAnimatedStyle(() => ({ opacity: numIn.value }));
  const coverStyle = useAnimatedStyle(() => ({ opacity: cover.value }));

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
      <Dither />
      {/* The day's footage now lives HERE (the player uses the animated
          ember gradient). Gradient stays underneath as the loading backdrop;
          MediaWash blurs and sinks it into this series' own dark stop. */}
      <VideoBackground source={PLACEHOLDER_VIDEO} paused={false} />
      {/* The wash STAYS through the countdown (Kat, Aug 17) — only the page
          chrome fades; the numbers play over the filtered, blurred footage. */}
      <MediaWash tint={gradient[0]} />
      {/* Fixed anchors measured off C3 Get Ready (see tokens.ts `anchor`). */}
      <SafeAreaView style={styles.content} edges={['left', 'right', 'bottom']}>
        <Animated.View
          style={[{ flex: 1 }, uiStyle]}
          pointerEvents={counting ? 'none' : 'auto'}>
        <View style={{ height: anchor.monoHeader }} />
        {seriesContext ? (
          <MonoHeader code={seriesContext.code} title={seriesContext.hint} dark>
            <SeriesDashes total={seriesContext.total} done={seriesContext.done} active dark />
          </MonoHeader>
        ) : (
          <AppText style={styles.spiral as never}>꩜</AppText>
        )}
        <View style={{ position: 'absolute', left: space.lg, right: space.lg, top: anchor.lead }}>
          <AppText variant="monoBody" dark>
            get ready to{'\n'}contemplate
          </AppText>
        </View>
        <View
          style={{ position: 'absolute', left: space.lg, right: space.lg, top: anchor.leadTitle }}>
          <AppText variant="displayLower" dark>
            {(seriesContext?.hint ?? 'a moment of stillness').toLowerCase()}
          </AppText>
        </View>
        <View
          style={{ position: 'absolute', left: space.lg, right: space.lg, top: anchor.optionLabelA }}>
          <AppText variant="caption" dark muted>
            Add time
          </AppText>
        </View>
        <View
          style={{ position: 'absolute', left: space.lg, right: space.lg, top: anchor.optionRowA }}>
          <MonoOptionRow
            options={timing.timerChoicesMin}
            value={minutes}
            onChange={setMinutes}
            labels={(m) => `${m} min`}
            testID="select-time"
          />
        </View>
        <View
          style={{ position: 'absolute', left: space.lg, right: space.lg, top: anchor.optionLabelB }}>
          <AppText variant="caption" dark muted>
            Select music
          </AppText>
        </View>
        <View
          style={{ position: 'absolute', left: space.lg, right: space.lg, top: anchor.optionRowB }}>
          <MonoOptionRow
            options={MUSIC_TRACKS}
            value={track}
            onChange={setTrack}
            testID="select-music"
          />
        </View>
        <View
          style={{
            position: 'absolute',
            left: space.lg,
            right: space.lg,
            top: anchor.bottomLinks,
          }}>
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
              label="Instructions,"
              dark
              muted
              onPress={() => setShowInstructions(true)}
              testID="instructions-button"
            />
            <TextLink label="Begin" dark onPress={begin} testID="begin-button" />
          </Row>
        </View>
        </Animated.View>
      </SafeAreaView>
      {/* 5..1, centred over the washed footage. */}
      {counting ? (
        <View style={styles.countdownWrap} pointerEvents="none" testID="countdown">
          <Animated.Text
            style={[styles.countdownNum, numStyle]}
            accessibilityLiveRegion="polite"
            accessibilityLabel={`Starting in ${count}`}>
            {count}
          </Animated.Text>
        </View>
      ) : null}
      {/* Final fade into the contemplation's flat dark ground. */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: color.dark }, coverStyle]}
      />
      <Sheet
        visible={showInstructions}
        onClose={() => setShowInstructions(false)}
        tone="overlay"
        title={instructions.title}>
        <InstructionsContent dark />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: space.lg },
  countdownWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNum: {
    // Same voice AND size as the contemplation copy (Kat, Aug 17) — the
    // countdown speaks at the question's own register, not over it.
    ...type.contemplation,
    color: color.onDark,
    textAlign: 'center',
    textShadowColor: 'rgba(24,28,12,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  spiral: { fontSize: 30, color: color.onDarkMuted, fontFamily: font.grotesk },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  option: {
    fontFamily: font.mono,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.56,
    color: color.onDarkMuted,
  },
});
