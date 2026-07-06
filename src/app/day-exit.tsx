/** C7 — Day Exit. Close the day; next open resumes where left off. */
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RatingPrompt } from '@/components/RatingPrompt';
import { Fade, ScreenFade } from '@/components/Transitions';
import { AppText, Button, Gap } from '@/components/ui';
import { dayExit } from '@/content/copy';
import { color } from '@/theme/tokens';
import { useApp } from '@/services/provider';
import { space } from '@/theme/tokens';

/** A slowly breathing mark — the day settling. Honors Reduce Motion. */
function BreathingMark() {
  const breathe = useSharedValue(0);
  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.quad), reduceMotion: ReduceMotion.System }),
      -1,
      true,
    );
  }, [breathe]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + breathe.value * 0.45,
    transform: [{ scale: 0.92 + breathe.value * 0.16 }],
  }));
  return (
    <Animated.Text
      accessible={false}
      style={[{ fontSize: 34, color: color.onDarkMuted, textAlign: 'left' }, style]}>
      ❋
    </Animated.Text>
  );
}

export default function DayExit() {
  const { data } = useApp();
  // Rotate the closing line by days practiced so it changes across the series.
  const daysPracticed = new Set(data.sessions.map((s) => s.date)).size;
  const closer = dayExit.closers[daysPracticed % dayExit.closers.length];

  return (
    <View style={styles.root}>
      <LinearGradient colors={[color.dark, '#4a5233']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.content}>
        <View style={{ flex: 1 }} />
        <BreathingMark />
        <Gap size="md" />
        <ScreenFade>
          <AppText variant="title" dark>
            {dayExit.title}
          </AppText>
        </ScreenFade>
        <Gap size="md" />
        <Fade delay={250}>
          <AppText variant="body" dark muted>
            {dayExit.body}
          </AppText>
        </Fade>
        <Gap size="sm" />
        <Fade delay={500}>
          <AppText variant="body" dark muted>
            {dayExit.body2}
          </AppText>
        </Fade>
        <Gap size="sm" />
        <Fade delay={750}>
          <AppText variant="body" dark muted>
            {dayExit.body3}
          </AppText>
        </Fade>
        <Gap size="lg" />
        <Fade delay={1050}>
          <AppText variant="body" dark style={{ fontStyle: 'italic' }}>
            {closer}
          </AppText>
        </Fade>
        <View style={{ flex: 1 }} />
        <Fade delay={600}>
          <Button label="Done" dark onPress={() => router.replace('/home')} testID="day-exit-done" />
        </Fade>
        <Gap size="lg" />
        <RatingPrompt />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.dark },
  content: { flex: 1, paddingHorizontal: space.lg },
});
