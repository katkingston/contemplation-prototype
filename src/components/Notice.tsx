/**
 * Notice — top pop-up pill (Open reference): a rounded dark capsule that
 * drops in from the top, auto-dismisses, and can be tapped away.
 * `notify()` is callable from anywhere; <NoticeHost/> renders in the root
 * layout. The provider's error state renders through the same pill so all
 * pop-ups share one voice.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/services/provider';
import { color, radius, space, type } from '@/theme/tokens';

type Kind = 'info' | 'success' | 'error';
interface Msg {
  id: number;
  kind: Kind;
  text: string;
}

let seq = 0;
let listener: ((m: Msg) => void) | null = null;

/** Show a top pop-up from anywhere. */
export function notify(text: string, kind: Kind = 'info') {
  listener?.({ id: ++seq, kind, text });
}

const AUTO_DISMISS_MS = 3500;

export function NoticeHost() {
  const insets = useSafeAreaInsets();
  const { error, clearError } = useApp();
  const reducedMotion = useReducedMotion();
  const [msg, setMsg] = useState<Msg | null>(null);
  const slide = useRef(new Animated.Value(-120)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = () => {
    if (timer.current) clearTimeout(timer.current);
    if (reducedMotion) {
      slide.setValue(-120);
      setMsg(null);
      if (error) clearError();
      return;
    }
    Animated.timing(slide, {
      toValue: -120,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: false, // web has no native driver; JS is fine for a pill
    }).start(() => {
      setMsg(null);
      if (error) clearError();
    });
  };

  const show = (m: Msg) => {
    if (timer.current) clearTimeout(timer.current);
    setMsg(m);
    if (reducedMotion) {
      slide.setValue(0); // appear in place, no motion
    } else {
      Animated.timing(slide, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // web has no native driver; JS is fine for a pill
      }).start();
    }
    timer.current = setTimeout(dismiss, AUTO_DISMISS_MS);
  };

  useEffect(() => {
    listener = show;
    return () => {
      listener = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Provider errors flow through the same pill (errors don't auto-dismiss).
  useEffect(() => {
    if (error) {
      if (timer.current) clearTimeout(timer.current);
      setMsg({ id: ++seq, kind: 'error', text: error });
      if (reducedMotion) {
        slide.setValue(0);
      } else {
        Animated.timing(slide, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false, // web has no native driver; JS is fine for a pill
        }).start();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  if (!msg) return null;
  const bg = msg.kind === 'error' ? color.danger : color.dark;
  return (
    <Animated.View
      style={[
        styles.wrap,
        { top: Math.max(insets.top, space.md), transform: [{ translateY: slide }] },
      ]}
      pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss notification"
        onPress={dismiss}
        style={[styles.pill, { backgroundColor: bg }]}
        testID="notice-pill">
        <Text style={styles.text} numberOfLines={3}>
          {msg.kind === 'success' ? '✓  ' : ''}
          {msg.text}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 8,
  },
  pill: {
    maxWidth: 420,
    marginHorizontal: space.lg,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: radius.pill,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  text: { ...type.small, color: color.onDark, textAlign: 'center' },
});
