/**
 * Gentle, ADA-compliant transitions. Every animation here is tagged
 * ReduceMotion.System: when the user's OS "Reduce Motion" setting is on,
 * Reanimated skips the animation entirely (content appears immediately).
 * Durations are short and easing soft — presence, not spectacle.
 */
import React from 'react';
import { ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, ReduceMotion } from 'react-native-reanimated';

/** Screen-content entrance: soft fade with a small settle from below. */
export function ScreenFade({
  children,
  style,
  delay = 0,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
}) {
  return (
    <Animated.View
      style={[{ flex: 1 }, style]}
      entering={FadeInDown.duration(320)
        .delay(delay)
        .reduceMotion(ReduceMotion.System)}>
      {children}
    </Animated.View>
  );
}

/** Plain fade for elements where any translation would feel busy. */
export function Fade({
  children,
  style,
  delay = 0,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
}) {
  return (
    <Animated.View
      style={style}
      entering={FadeIn.duration(280).delay(delay).reduceMotion(ReduceMotion.System)}>
      {children}
    </Animated.View>
  );
}
