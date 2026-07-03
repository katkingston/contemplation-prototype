/**
 * ContemplationPlayer — the core screen.
 * - Full-bleed ambient background: generated gradient with slow drift
 *   (cross-fading layers), or a video loop when `videoUri` is set (expo-video).
 * - Question large and centered, animated in.
 * - Hidden timer (no countdown UI); gentle pulse during the final 5 seconds;
 *   auto-finishes when time is up.
 * - Only small, dim Pause/End controls (wireframe) + persistent Crisis pill
 *   (App-CLAUDE.md hard rule).
 */
import { useAudioPlayer } from 'expo-audio';
import { useVideoPlayer, VideoSource, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CrisisButton } from '@/components/CrisisButton';
import { color, space, timing, type } from '@/theme/tokens';

export type FinishReason = 'time' | 'end';

/** Placeholder media for ALL contemplations until per-contemplation assets exist. */
const PLACEHOLDER_VIDEO: VideoSource = require('../../assets/media/contemplation-loop.mp4');
const AMBIENT_MUSIC = require('../../assets/media/ambient-music.mp3');

function VideoBackground({ source, paused }: { source: VideoSource; paused: boolean }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  useEffect(() => {
    if (paused) player.pause();
    else player.play();
  }, [paused, player]);
  return <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />;
}

export function ContemplationPlayer({
  prompt,
  gradient,
  videoUri,
  minutes,
  musicOn = true,
  onFinish,
}: {
  prompt: string;
  gradient: [string, string];
  videoUri: string | null;
  minutes: number;
  musicOn?: boolean;
  onFinish: (reason: FinishReason, secondsElapsed: number) => void;
}) {
  const totalSeconds = Math.round(minutes * 60);
  const [paused, setPaused] = useState(false);

  // --- ambient music (placeholder track), honoring the Get Ready choice ---
  const music = useAudioPlayer(AMBIENT_MUSIC);
  useEffect(() => {
    music.loop = true;
    if (musicOn && !paused) music.play();
    else music.pause();
  }, [music, musicOn, paused]);
  const elapsedRef = useRef(0);
  const finishedRef = useRef(false);
  const [inFinalPulse, setInFinalPulse] = useState(false);

  // --- animations ---
  const textIn = useSharedValue(0);
  const drift = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    textIn.value = withTiming(1, { duration: 1800, easing: Easing.out(Easing.cubic) });
    drift.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.quad) }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (inFinalPulse) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 700, easing: Easing.inOut(Easing.quad) }),
          withTiming(1.0, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(1, { duration: 200 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inFinalPulse]);

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
        onFinish('time', elapsedRef.current);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [paused, totalSeconds, onFinish]);

  const handleEnd = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish('end', elapsedRef.current);
  };

  const textStyle = useAnimatedStyle(() => ({
    opacity: textIn.value,
    transform: [{ translateY: (1 - textIn.value) * 14 }, { scale: pulse.value }],
  }));
  const driftStyle = useAnimatedStyle(() => ({ opacity: drift.value }));

  return (
    <View style={styles.root} testID="contemplation-player">
      {/* Gradient stays underneath as the load/fallback backdrop. */}
      <LinearGradient
        colors={[gradient[0], gradient[1]]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />
      <Animated.View style={[StyleSheet.absoluteFill, driftStyle]}>
        <LinearGradient
          colors={[gradient[1], gradient[0]]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.9, y: 0.1 }}
          end={{ x: 0.1, y: 0.9 }}
        />
      </Animated.View>
      <VideoBackground source={videoUri ?? PLACEHOLDER_VIDEO} paused={paused} />
      {/* Scrim for text legibility over bright footage. */}
      <View style={styles.scrim} pointerEvents="none" />
      {paused && <View style={styles.pausedOverlay} pointerEvents="none" />}
      <SafeAreaView style={styles.content}>
        <View style={styles.topRow}>
          <CrisisButton dim />
        </View>
        <View style={styles.center}>
          <Animated.Text style={[type.contemplation, styles.prompt, textStyle]}>
            {prompt}
          </Animated.Text>
        </View>
        <View style={styles.controls}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setPaused((p) => !p)}
            style={styles.control}
            testID="pause-button">
            <Text style={styles.controlText}>{paused ? '▶ Resume' : '❚❚ Pause'}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={handleEnd}
            style={styles.control}
            testID="end-button">
            <Text style={styles.controlText}>✕ End</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.dark },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(24,28,12,0.42)' },
  pausedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  content: { flex: 1, paddingHorizontal: space.lg },
  topRow: { alignItems: 'flex-end', paddingTop: space.sm },
  center: { flex: 1, justifyContent: 'center' },
  prompt: { color: '#efe9db', textAlign: 'left' },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space.md,
    paddingBottom: space.lg,
    opacity: 0.55,
  },
  control: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(239,233,219,0.5)',
  },
  controlText: { ...type.caption, textTransform: 'uppercase', letterSpacing: 0.8, color: '#efe9db' },
});
