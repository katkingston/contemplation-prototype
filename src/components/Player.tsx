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
import { useAudioPlayer } from 'expo-audio';
import { useVideoPlayer, VideoSource, VideoView } from 'expo-video';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { TextLink } from '@/components/ui';
import { anchor, color, space, timing, type } from '@/theme/tokens';

export type FinishReason = 'time' | 'end';

/** Placeholder media for ALL contemplations until per-contemplation assets exist. */
export const PLACEHOLDER_VIDEO: VideoSource = require('../../assets/media/contemplation-loop.mp4');
const AMBIENT_MUSIC = require('../../assets/media/ambient-music.mp3');

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
function hexToRgba(hex: string, a: number): string {
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
  const [paused, setPaused] = useState(false);
  const elapsedRef = useRef(0);
  const finishedRef = useRef(false);
  const [inFinalPulse, setInFinalPulse] = useState(false);

  // --- ambient music: plays ONLY on this screen, only if chosen; pauses with the practice ---
  const music = useAudioPlayer(AMBIENT_MUSIC);
  useEffect(() => {
    music.loop = true;
    if (musicOn && !paused && !finishedRef.current) music.play();
    else music.pause();
  }, [music, musicOn, paused]);
  useEffect(() => {
    // Hard stop when leaving the contemplation, whatever the route.
    return () => {
      try {
        music.pause();
      } catch {
        // player may already be released on unmount
      }
    };
  }, [music]);

  // --- animations (respect OS reduce-motion) ---
  const reducedMotion = useReducedMotion();
  const textIn = useSharedValue(0);
  const drift = useSharedValue(0);
  const driftB = useSharedValue(0);
  const driftC = useSharedValue(0);
  const scrimPulse = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      textIn.value = 1;
      drift.value = 0.5;
      driftB.value = 0.5;
      driftC.value = 0.5;
      return;
    }
    textIn.value = withTiming(1, { duration: 1800, easing: Easing.out(Easing.cubic) });
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
        music.pause();
        onFinish('time', elapsedRef.current);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [paused, totalSeconds, onFinish, music]);

  const handleEnd = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    music.pause();
    onFinish('end', elapsedRef.current);
  };

  const textStyle = useAnimatedStyle(() => ({
    opacity: textIn.value,
    transform: [{ translateY: (1 - textIn.value) * 14 }],
  }));
  // Three layers breathe on different periods so the field never repeats
  // visibly: the halo swells, the glow drifts across it, the core pulses.
  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + drift.value * 0.45,
    transform: [{ scale: 1.02 + drift.value * 0.12 }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + driftB.value * 0.5,
    transform: [
      { scale: 0.96 + driftB.value * 0.14 },
      { translateY: -18 + driftB.value * 36 },
    ],
  }));
  const coreStyle = useAnimatedStyle(() => ({
    opacity: 0.9 + driftC.value * 0.1,
    transform: [{ scale: 0.985 + driftC.value * 0.035 }],
  }));
  const pulseStyle = useAnimatedStyle(() => ({ opacity: scrimPulse.value * 0.3 }));

  // Ember palette derived from this contemplation's own gradient
  // (Kat's refs: pale field → warm lift → saturated glow → near-black core).
  const edge = mixHex(gradient[1], 'f4f4ec', 0.9);
  const lift = mixHex(gradient[1], color.accentBright.slice(1), 0.5);
  const glow = mixHex(gradient[1], gradient[0], 0.3);
  const core = mixHex(gradient[0], '000000', 0.5);

  // Concentric rings, widest+faintest first, produce the airbrushed falloff
  // WITHOUT leaning on a blur pass (BlurView's tint washes the colour out on
  // web). Many small steps keep it smooth instead of banded. All are centred
  // on the question block, so the field reads as light radiating from the
  // words themselves.
  const RING_COUNT = 22;
  const rings = Array.from({ length: RING_COUNT }, (_, i) => {
    const t0 = i / (RING_COUNT - 1); // 0 = outermost, 1 = innermost
    const ease = t0 * t0; // concentrate opacity near the core
    return {
      inset: -170 + t0 * 212, // -170 → +42
      rise: 250 - t0 * 212, // 250 → 38
      hex: t0 < 0.45 ? lift : t0 < 0.78 ? glow : core,
      a: 0.05 + ease * 0.72,
      r: 320 - t0 * 230,
    };
  });

  return (
    <View style={[styles.root, { backgroundColor: edge }]} testID="contemplation-player">
      {/* Animated ember field, aligned to the question. The halo and glow
          layers breathe on different periods; the rings give the diffusion. */}
      <Animated.View style={[styles.halo, haloStyle]} pointerEvents="none">
        <LinearGradient
          colors={[edge, lift, edge]}
          locations={[0, 0.5, 1]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={styles.bandFill}
        />
      </Animated.View>
      <Animated.View style={[styles.glowBand, glowStyle]} pointerEvents="none">
        {rings.map((ring, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: ring.inset,
              right: ring.inset,
              top: 240 - ring.rise,
              bottom: 240 - ring.rise,
              borderRadius: ring.r,
              backgroundColor: hexToRgba(ring.hex, ring.a),
            }}
          />
        ))}
      </Animated.View>
      <Animated.View
        style={[styles.coreBand, { backgroundColor: `#${core}` }, coreStyle]}
        pointerEvents="none"
      />
      {/* Light blur only to kill banding — not doing the diffusion work. */}
      <BlurView
        intensity={34}
        tint="default"
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Final-5s breathing layer. */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: `rgb(${SCRIM_RGB})` }, pulseStyle]}
      />
      {!paused ? (
        // Jul 30 designs: no visible pause control — tapping the surface
        // pauses. The overlay sits under the text/links so Crisis stays tappable.
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pause contemplation"
          onPress={() => setPaused(true)}
          style={StyleSheet.absoluteFill}
          testID="pause-button"
        />
      ) : null}
      <SafeAreaView style={styles.content} pointerEvents="box-none">
        <View style={styles.center} pointerEvents="none">
          <View style={{ height: anchor.statement }} />
          <Animated.Text style={[styles.prompt, textStyle]}>{prompt}</Animated.Text>
        </View>
        <View style={styles.bottomRow}>
          {/* Crisis ENDS the contemplation immediately (media stops on
              unmount, nothing recorded) and opens full-screen support. */}
          <TextLink
            label="Crisis Support"
            dark
            muted
            small
            onPress={() => router.replace('/crisis')}
            testID="crisis-button"
          />
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
              <View style={{ height: anchor.statement }} />
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
              <View style={{ height: anchor.statement + 120 }} />
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
                <TextLink label="End" dark muted onPress={handleEnd} testID="end-button" />
              </View>
            </View>
            <View style={styles.bottomRow}>
              <TextLink
                label="Crisis Support"
                dark
                muted
                small
                onPress={() => router.replace('/crisis')}
                testID="crisis-button-paused"
              />
            </View>
          </SafeAreaView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.dark },
  // Ember bands (Kat's gradient refs). Geometry is ALIGNED TO THE QUESTION:
  // the core wraps the text block at `anchor.statement`, and the glow/halo
  // radiate outward from it. Huge radii keep the edges soft pre-blur.
  bandFill: { flex: 1, borderRadius: 140 },
  halo: {
    position: 'absolute',
    left: '-14%',
    right: '-14%',
    top: anchor.statement - 250,
    height: 700,
  },
  glowBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: anchor.statement - 202,
    height: 480,
  },
  coreBand: {
    position: 'absolute',
    left: '11%',
    right: '11%',
    top: anchor.statement - 68,
    height: 212,
    borderRadius: 76,
  },
  content: { flex: 1, paddingHorizontal: 32 },
  center: { flex: 1 },
  prompt: {
    // Jul 30 designs: the question speaks in the typewriter mono, centered.
    ...type.contemplation,
    color: color.onDark,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingBottom: space.lg,
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
    textAlign: 'center',
    opacity: 0.8,
    fontFamily: type.body.fontFamily,
  },
  pausedLabel: {
    ...type.monoBody,
    color: color.onOverlay,
    textAlign: 'center',
  },
  pausedLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space.md,
  },
});
