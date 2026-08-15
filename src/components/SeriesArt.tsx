/**
 * SeriesArt — generated series artwork: the ambient gradient plus flat
 * organic shapes (Open covers photo + flat shape; ours is gradient + flat
 * shape, per the airbrushed-nail-art reference). Deterministic per seed so
 * every contemplation has its own stable composition. Replaced by real
 * artwork later via the same slot (videoUri/art per contemplation).
 */
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Dither } from '@/components/Dither';

export function SeriesArt({
  gradient,
  accent,
  seed = 0,
  style,
}: {
  gradient: [string, string];
  /** Flat shape color — the third stop of the series palette. */
  accent: string;
  /** Varies shape placement per contemplation. Stable, not random. */
  seed?: number;
  style?: ViewStyle;
}) {
  // Deterministic composition from the seed.
  const s = ((seed % 7) + 7) % 7;
  const circleSize = 42 + (s % 3) * 14; // % of container width
  const circleTop = 12 + ((s * 13) % 38);
  const circleLeft = s % 2 === 0 ? 38 + ((s * 7) % 30) : 6 + ((s * 9) % 22);
  const showBar = s % 3 !== 1;

  return (
    <View style={[styles.frame, style]} accessible={false} importantForAccessibility="no">
      <LinearGradient
        colors={[gradient[0], gradient[1]]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Dither />
      <View
        style={{
          position: 'absolute',
          width: `${circleSize}%`,
          aspectRatio: 1,
          borderRadius: 999,
          top: `${circleTop}%`,
          left: `${circleLeft}%`,
          backgroundColor: accent,
          opacity: 0.85,
        }}
      />
      {showBar && (
        <View
          style={{
            position: 'absolute',
            width: '26%',
            height: '13%',
            bottom: `${8 + ((s * 11) % 20)}%`,
            left: s % 2 === 0 ? '8%' : '64%',
            backgroundColor: gradient[0],
            opacity: 0.9,
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden' },
});
