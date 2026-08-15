/**
 * Dither — the fix for gradient banding.
 *
 * A smooth two-stop ramp across a large area needs more intermediate values
 * than 8-bit colour can express, so it renders as visible steps. Overlaying a
 * faint tiled noise texture perturbs each pixel by a hair, which turns those
 * hard steps into stipple the eye reads as a smooth blend — the same trick as
 * "add noise" on a gradient in Photoshop.
 *
 * Sits ON TOP of the gradient and under the content. Never intercepts touches.
 */
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const NOISE = require('../../assets/media/noise-dither.png');

export function Dither({
  /** 0.02–0.06 works; higher starts reading as texture rather than smoothing. */
  opacity = 0.035,
}: {
  opacity?: number;
}) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image
        source={NOISE}
        resizeMode="repeat"
        style={[StyleSheet.absoluteFill, { opacity }]}
        accessible={false}
        importantForAccessibility="no"
      />
    </View>
  );
}
