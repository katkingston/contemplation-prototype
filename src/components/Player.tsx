/**
 * ContemplationPlayer — the core screen.
 * - Full-bleed video loop (placeholder for all contemplations) over an
 *   ambient gradient fallback; covers the entire area.
 * - Layered legibility scrim (heavier top/bottom, subtle center) + text
 *   shadow so UI reads over ANY footage. Final 5 seconds: the scrim pulses
 *   gently (the text itself no longer animates).
 * - Question set in the handwriting face (stand-in for future handwritten
 *   images) — contemplation mode only.
 * - Ambient music (if chosen on Get Ready) plays ONLY here; pausing the
 *   practice pauses the music too.
 * - Only small, dim Pause/End controls + persistent Crisis pill (hard rule).
 */
import { useVideoPlayer, VideoSource, VideoView } from 'expo-video';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Dither } from '@/components/Dither';
import { TextLink, useAnchor } from '@/components/ui';
import { pauseAmbient, playAmbient } from '@/services/ambient';
import { anchor, color, space, timing, type } from '@/theme/tokens';

export type FinishReason = 'time' | 'end';

/**
 * How the words arrive (Kat, Aug 17): the field blooms out of the flat dark
 * ground first, then the question animates on word by word.
 */
// Slowed twice per Kat (Aug 17, then again Aug 19) — the field blooms long
// and the words surface one breath at a time.
const FIELD_IN_MS = 1600;
const WORD_STAGGER_MS = 350;
const WORD_IN_MS = 2400;

/** One word of the prompt, fading up on its own beat. */
function WordIn({ word, delay }: { word: string; delay: number }) {
  const reducedMotion = useReducedMotion();
  const v = useSharedValue(0);
  useEffect(() => {
    if (reducedMotion) {
      v.value = 1;
      return;
    }
    v.value = withDelay(delay, withTiming(1, { duration: WORD_IN_MS, easing: Easing.out(Easing.cubic) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Opacity only (Kat, Aug 17) — the words surface gently, nothing moves.
  const st = useAnimatedStyle(() => ({ opacity: v.value }));
  return <Animated.Text style={[styles.prompt, st]}>{word}</Animated.Text>;
}

/** The prompt as a centred, wrapping row of individually-entering words. */
function PromptWords({ prompt }: { prompt: string }) {
  const words = prompt.split(/\s+/).filter(Boolean);
  return (
    <View style={styles.promptRow}>
      {words.map((w, i) => (
        <WordIn key={`${i}-${w}`} word={w} delay={FIELD_IN_MS + i * WORD_STAGGER_MS} />
      ))}
    </View>
  );
}

/** Placeholder media for ALL contemplations until per-contemplation assets exist. */
export const PLACEHOLDER_VIDEO: VideoSource = require('../../assets/media/contemplation-loop.mp4');

const SCRIM_RGB = '24,28,12'; // dark olive

export function VideoBackground({ source, paused }: { source: VideoSource; paused: boolean }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  useEffect(() => {
    if (paused) player.pause();
    else player.play();
  }, [paused, player]);
  useEffect(() => {
    // iPhone Safari hijacks non-inline video into the fullscreen player,
    // covering the question. Force inline/muted/looping attributes on web.
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const fix = () => {
      document.querySelectorAll('video').forEach((v) => {
        v.setAttribute('playsinline', '');
        v.setAttribute('webkit-playsinline', '');
        v.muted = true;
        v.loop = true;
      });
    };
    fix();
    const t = setInterval(fix, 500); // catch late mounts/replacements
    const stop = setTimeout(() => clearInterval(t), 4000);
    return () => {
      clearInterval(t);
      clearTimeout(stop);
    };
  }, []);
  return (
    <VideoView
      player={player}
      style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
      contentFit="cover"
      nativeControls={false}
      accessible={false}
      importantForAccessibility="no"
    />
  );
}

/** Hex (with or without #) to an rgba() string at the given alpha. */
export function hexToRgba(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Mix two hex colors (no #) — t=0 returns a, t=1 returns b. */
function mixHex(a: string, b: string, t: number): string {
  const ah = a.replace('#', '');
  const bh = b.replace('#', '');
  let out = '';
  for (let i = 0; i < 3; i++) {
    const av = parseInt(ah.slice(i * 2, i * 2 + 2), 16);
    const bv = parseInt(bh.slice(i * 2, i * 2 + 2), 16);
    out += Math.round(av + (bv - av) * t)
      .toString(16)
      .padStart(2, '0');
  }
  return out;
}

/**
 * The shared treatment for real footage (Get Ready + the Home hero): a soft
 * blur, then a deep wash in THIS series' own darkest stop so the video sits
 * inside the series colour instead of reading as raw video under grey.
 */
export function MediaWash({ tint }: { tint: string }) {
  return (
    <>
      <BlurView
        intensity={20}
        tint="default"
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: hexToRgba(tint, 0.78) }]}
        pointerEvents="none"
      />
    </>
  );
}

export function ContemplationPlayer({
  prompt,
  gradient,
  minutes,
  musicOn = true,
  onFinish,
}: {
  prompt: string;
  gradient: [string, string];
  minutes: number;
  musicOn?: boolean;
  onFinish: (reason: FinishReason, secondsElapsed: number) => void;
}) {
  const totalSeconds = Math.round(minutes * 60);
  // Viewport-proportional grid (type never scales) — see useAnchor in ui.tsx.
  const ax = useAnchor();
  const [paused, setPaused] = useState(false);
  const elapsedRef = useRef(0);
  const finishedRef = useRef(false);
  const [inFinalPulse, setInFinalPulse] = useState(false);

  // --- ambient music: the SHARED player the Get Ready countdown already
  // started; pauses with the practice, and stops on every way out. On web the
  // router keeps left screens mounted, so unmount cleanup never runs — the
  // blur callback below is the stop that actually fires when the route
  // changes (finish, End, and Crisis included).
  useEffect(() => {
    if (musicOn && !paused && !finishedRef.current) playAmbient();
    else pauseAmbient();
  }, [musicOn, paused]);
  useFocusEffect(
    useCallback(() => {
      return () => pauseAmbient();
    }, []),
  );
  useEffect(() => {
    return () => pauseAmbient();
  }, []);

  // --- animations (respect OS reduce-motion) ---
  const reducedMotion = useReducedMotion();
  const fieldIn = useSharedValue(0);
  const drift = useSharedValue(0);
  const driftB = useSharedValue(0);
  const driftC = useSharedValue(0);
  const scrimPulse = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      fieldIn.value = 1;
      drift.value = 0.5;
      driftB.value = 0.5;
      driftC.value = 0.5;
      return;
    }
    // The screen opens as the flat dark ground the Get Ready countdown faded
    // into; the ember field blooms out of it, then the words follow (below).
    fieldIn.value = withTiming(1, { duration: FIELD_IN_MS, easing: Easing.out(Easing.cubic) });
    // Mutually prime periods so the three layers never resync into a visible loop.
    const breathe = (ms: number) =>
      withRepeat(withTiming(1, { duration: ms, easing: Easing.inOut(Easing.quad) }), -1, true);
    drift.value = breathe(11000);
    driftB.value = breathe(17000);
    driftC.value = breathe(23000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  useEffect(() => {
    if (inFinalPulse && !reducedMotion) {
      // The BACKGROUND breathes at the end — the text stays still.
      scrimPulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      );
    } else {
      cancelAnimation(scrimPulse);
      scrimPulse.value = withTiming(0, { duration: 300 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inFinalPulse, reducedMotion]);

  // --- hidden timer ---
  useEffect(() => {
    if (paused || finishedRef.current) return;
    const id = setInterval(() => {
      elapsedRef.current += 1;
      const remaining = totalSeconds - elapsedRef.current;
      if (remaining <= timing.endPulseMs / 1000 && remaining > 0) setInFinalPulse(true);
      if (remaining <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        clearInterval(id);
        pauseAmbient();
        onFinish('time', elapsedRef.current);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [paused, totalSeconds, onFinish]);

  const handleEnd = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    pauseAmbient();
    onFinish('end', elapsedRef.current);
  };

  // ONE field, breathing. Two drivers on co-prime periods are combined into a
  // single transform so the whole thing swells and drifts as one body; the
  // whole field is scaled by its own entrance fade.
  const fieldStyle = useAnimatedStyle(() => ({
    opacity: (0.9 + driftC.value * 0.1) * fieldIn.value,
    transform: [
      { scale: 1 + drift.value * 0.08 },
      { translateY: -14 + driftB.value * 28 },
    ],
  }));
  const pulseStyle = useAnimatedStyle(() => ({ opacity: scrimPulse.value * 0.3 }));

  // Ember palette derived from this contemplation's own gradient
  // (Kat's refs: pale field → warm lift → saturated glow → near-black core).
  const edge = mixHex(gradient[1], 'f4f4ec', 0.3);
  const lift = mixHex(gradient[1], color.accentBright.slice(1), 0.28);
  const glow = mixHex(gradient[0], gradient[1], 0.25);
  const core = mixHex(gradient[0], '000000', 0.72);

  /** Continuous colour ramp edge → lift → glow → core (no hard bands). */
  function rampAt(t: number): string {
    if (t < 0.26) return mixHex(edge, lift, t / 0.26);
    if (t < 0.58) return mixHex(lift, glow, (t - 0.26) / 0.32);
    return mixHex(glow, core, (t - 0.58) / 0.42);
  }

  // A SINGLE stack of concentric rings carries the whole field — the dark core
  // is just the innermost rings of the same ramp, so it melds into the glow
  // instead of sitting on top as a separate shape. Colour and alpha both
  // interpolate continuously; the blur then smooths what's left.
  const RING_COUNT = 30;
  const rings = Array.from({ length: RING_COUNT }, (_, i) => {
    const t = i / (RING_COUNT - 1); // 0 = outermost, 1 = innermost
    return {
      inset: -300 + t * 360, // wider field than before
      rise: 470 - t * 400,
      hex: rampAt(t),
      a: 0.14 + Math.pow(t, 1.15) * 0.86, // opaque by the core
      r: 380 - t * 290,
    };
  });

  return (
    <View style={[styles.root, { backgroundColor: edge }]} testID="contemplation-player">
      {/* One animated ember field, centred on the question: a single ring
          stack running pale edge → glow → near-black core, then blurred so
          the whole thing melds. */}
      <Animated.View
        style={[styles.field, { top: ax(anchor.statement) - 330 }, fieldStyle]}
        pointerEvents="none">
        {rings.map((ring, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: ring.inset,
              right: ring.inset,
              top: 300 - ring.rise,
              bottom: 300 - ring.rise,
              borderRadius: ring.r,
              backgroundColor: hexToRgba(ring.hex, ring.a),
            }}
          />
        ))}
      </Animated.View>
      {/* High blur melds the ring stack into one continuous field. */}
      <BlurView
        intensity={70}
        tint="default"
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Dither goes ABOVE the blur — below it the blur would average the
          noise away, which is exactly what it is there to prevent. */}
      <Dither />
      {/* Final-5s breathing layer. */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: `rgb(${SCRIM_RGB})` }, pulseStyle]}
      />
      {!paused ? (
        // Jul 30 designs: no visible pause control — tapping the surface
        // pauses.
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pause contemplation"
          onPress={() => setPaused(true)}
          style={StyleSheet.absoluteFill}
          testID="pause-button"
        />
      ) : null}
      {/* No chrome at all during the live contemplation (Kat, Aug 17) —
          Crisis Support lives on the paused screen, one surface-tap away.
          NOTE: this deviates from App-CLAUDE.md's "persistent button on every
          contemplation screen" hard rule; revisit before App Store review. */}
      <SafeAreaView style={styles.content} pointerEvents="box-none">
        <View style={styles.center} pointerEvents="none">
          <View style={{ height: ax(anchor.statement) }} />
          <PromptWords prompt={prompt} />
        </View>
      </SafeAreaView>
      {paused ? (
        // Paused state — full taupe surface (C4 Player · Tap Pause): the
        // question stays in place but sits UNDER a blur layer so the
        // contemplation is hidden; spiral + "contemplation paused" +
        // Resume / End render crisply on top. Crisis stays reachable
        // (hard rule: every contemplation screen).
        <View style={[StyleSheet.absoluteFill, styles.pausedScreen]}>
          <SafeAreaView style={styles.content} pointerEvents="none">
            <View style={styles.center}>
              {/* Same anchor as the live question, so blurring it in place
                  does not make the text appear to jump. */}
              <View style={{ height: ax(anchor.statement) }} />
              <Text style={[styles.prompt, styles.pausedPrompt]}>{prompt}</Text>
            </View>
          </SafeAreaView>
          <BlurView
            intensity={34}
            tint="light"
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView style={[StyleSheet.absoluteFill, styles.content]}>
            <View style={styles.center}>
              {/* Controls sit just below the (blurred) question block. */}
              <View style={{ height: ax(anchor.statement) + 120 }} />
              <Text style={styles.pausedSpiral}>꩜</Text>
              <View style={{ height: space.xl }} />
              <Text style={styles.pausedLabel}>contemplation paused</Text>
              <View style={{ height: space.md }} />
              <View style={styles.pausedLinks}>
                <TextLink
                  label="Resume,"
                  dark
                  onPress={() => setPaused(false)}
                  testID="resume-button"
                />
                {/* Right next to Resume (Kat, Aug 17). Ends the contemplation
                    immediately — media stops, nothing recorded — and opens
                    the mental-health resources page (the single support page
                    since Aug 18; the separate X1 crisis screen is gone). */}
                <TextLink
                  label="Crisis Support,"
                  dark
                  muted
                  onPress={() => router.replace('/resources')}
                  testID="crisis-button"
                />
                <TextLink label="End" dark muted onPress={handleEnd} testID="end-button" />
              </View>
            </View>
          </SafeAreaView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.dark },
  // The ember field (Kat's gradient refs), ALIGNED TO THE QUESTION: one box
  // centred on the text block at `anchor.statement`, holding the whole ring
  // stack. Deliberately taller/wider than the screen so the falloff runs off
  // the edges rather than stopping inside them.
  field: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 800,
  },
  content: { flex: 1, paddingHorizontal: 32 },
  center: { flex: 1 },
  // Words enter one by one, wrapping as centred lines; the column gap stands
  // in for the mono space the split removed (HAL advance ≈ 0.6em at 16).
  // Left-aligned (Kat, Aug 19) — the words set like a page, not a poster.
  promptRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    columnGap: 9,
  },
  prompt: {
    // Jul 30 designs: the question speaks in the typewriter mono, centered.
    ...type.contemplation,
    color: color.onDark,
    textAlign: 'left',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  pausedScreen: { backgroundColor: color.overlay },
  pausedPrompt: {
    opacity: 0.55,
    textShadowColor: 'transparent',
    color: color.onOverlay,
  },
  pausedSpiral: {
    fontSize: 30,
    color: color.onOverlay,
    textAlign: 'left',
    opacity: 0.8,
    fontFamily: type.body.fontFamily,
  },
  pausedLabel: {
    ...type.monoBody,
    color: color.onOverlay,
    textAlign: 'left',
  },
  pausedLinks: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: space.md,
  },
});
