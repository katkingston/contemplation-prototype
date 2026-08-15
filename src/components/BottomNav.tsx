/**
 * Bottom navigation — Jul 30 designs: three always-visible text labels
 * (Today / Journey / Account), a small dot above the active one, and a
 * "Next session …" ambient line underneath. The bar matches the screen's
 * surface tone (light on paper screens, dark on dark screens); square
 * corners. Flow screens (contemplation, journal…) intentionally have no bar.
 */
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fade } from '@/components/Transitions';
import { activeSeries, dropLabel, isDropAvailable, nextDropAt } from '@/services/logic';
import { useApp } from '@/services/provider';
import { color, space, type } from '@/theme/tokens';

export type TabKey = 'today' | 'journey' | 'account';

const TABS: { key: TabKey; label: string; route: string }[] = [
  { key: 'today', label: 'Today', route: '/home' },
  // Journey tab lands on the menu screen (quote + series/journey/learn).
  { key: 'journey', label: 'Journey', route: '/menu' },
  { key: 'account', label: 'Account', route: '/account' },
];

export function BottomNav({ active, dark = false }: { active: TabKey; dark?: boolean }) {
  const insets = useSafeAreaInsets();
  const { data } = useApp();
  const s = activeSeries(data);
  const dropAt = nextDropAt(data, s.id);
  const ready = isDropAvailable(data, s.id);
  const ambient = ready
    ? 'A contemplation awaits'
    : dropAt
      ? `Next session ${dropLabel(dropAt)}`
      : '';
  const fg = dark ? color.onDark : color.ink;
  const fgMuted = dark ? color.onDarkMuted : color.muted;

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: dark ? color.dark : color.paper },
        { paddingBottom: Math.max(insets.bottom, space.md) },
      ]}>
      <View style={styles.tabsRow}>
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <Pressable
              key={t.key}
              accessibilityRole="button"
              accessibilityLabel={t.label}
              accessibilityState={{ selected: isActive }}
              onPress={() => !isActive && router.replace(t.route as never)}
              style={styles.item}
              testID={`tab-${t.key}`}>
              <View style={[styles.activeDot, { backgroundColor: isActive ? fg : 'transparent' }]} />
              <Text
                style={[
                  isActive ? type.bodyBold : type.body,
                  { color: isActive ? fg : fgMuted },
                ]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {ambient ? <Text style={[styles.ambient, { color: fgMuted }]}>{ambient}</Text> : null}
    </View>
  );
}

/** Hub-screen shell: scrollable content + persistent bottom bar, empty top. */
export function TabScreen({
  active,
  children,
  padded = true,
  dark = false,
  bleedTop = false,
}: {
  active: TabKey;
  children: React.ReactNode;
  padded?: boolean;
  dark?: boolean;
  /**
   * Screens whose art runs under the status bar (Learn, Home). The designs
   * measure those heroes from the true top of the frame, so the shell must not
   * push them down by the safe-area inset — the screen handles its own.
   */
  bleedTop?: boolean;
}) {
  return (
    <SafeAreaView
      style={[styles.shell, dark && { backgroundColor: color.dark }]}
      edges={bleedTop ? ['left', 'right'] : ['top', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          padded && { paddingHorizontal: space.lg },
          { paddingBottom: 120, flexGrow: 1 },
        ]}
        keyboardShouldPersistTaps="handled">
        <Fade style={{ flex: 1 }}>{children}</Fade>
      </ScrollView>
      <BottomNav active={active} dark={dark} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: color.paper },
  bar: {
    paddingTop: space.sm,
    paddingHorizontal: space.lg,
  },
  tabsRow: { flexDirection: 'row', justifyContent: 'center', gap: space.xl },
  ambient: {
    ...type.caption,
    textAlign: 'center',
    marginTop: space.xs,
  },
  item: { alignItems: 'center', gap: 3, minHeight: 44, justifyContent: 'flex-start' },
  activeDot: { width: 4, height: 4, borderRadius: 2 },
});
