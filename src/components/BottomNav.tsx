/**
 * Bottom navigation — emulates the Open reference: a dark horizon bar with
 * quiet glyphs, and a small caps label under the active item only.
 * Used by the hub screens (Today / Menu / Account); flow screens
 * (contemplation, journal…) intentionally have no bar.
 */
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { activeSeries, dropLabel, isDropAvailable, nextDropAt } from '@/services/logic';
import { useApp } from '@/services/provider';
import { color, space, type } from '@/theme/tokens';

export type TabKey = 'today' | 'journey' | 'account';

const TABS: { key: TabKey; glyph: (initial: string) => string; label: string; route: string }[] = [
  { key: 'today', glyph: () => '❋', label: 'Today', route: '/home' },
  { key: 'journey', glyph: () => '꩜', label: 'Journey', route: '/journey' },
  { key: 'account', glyph: (initial) => initial, label: 'Account', route: '/account' },
];

export function BottomNav({ active }: { active: TabKey }) {
  const insets = useSafeAreaInsets();
  const { data } = useApp();
  const initial = (data.profile?.username?.[0] ?? '•').toUpperCase();
  // Ambient footer, per the Open reference ("Sunset 7:35 PM"): the daily drop.
  const s = activeSeries(data);
  const dropAt = nextDropAt(data, s.id);
  const ready = isDropAvailable(data, s.id);
  const ambient = ready ? 'A contemplation awaits' : dropAt ? `New contemplation ${dropLabel(dropAt)}` : '';

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
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
            <Text style={[styles.glyph, { opacity: isActive ? 1 : 0.45 }]}>
              {t.glyph(initial)}
            </Text>
            {isActive && <Text style={styles.label}>{t.label}</Text>}
          </Pressable>
        );
      })}
      </View>
      {ambient ? <Text style={styles.ambient}>{ambient}</Text> : null}
    </View>
  );
}

/** Hub-screen shell: scrollable content + persistent bottom bar, empty top. */
export function TabScreen({
  active,
  children,
  padded = true,
  dark = false,
}: {
  active: TabKey;
  children: React.ReactNode;
  padded?: boolean;
  dark?: boolean;
}) {
  return (
    <SafeAreaView
      style={[styles.shell, dark && { backgroundColor: color.dark }]}
      edges={['top', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          padded && { paddingHorizontal: space.lg },
          { paddingBottom: 120, flexGrow: 1 },
        ]}
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      <BottomNav active={active} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: color.paper },
  bar: {
    backgroundColor: color.dark,
    paddingTop: space.md,
    paddingHorizontal: space.lg,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  tabsRow: { flexDirection: 'row' },
  ambient: {
    ...type.label,
    color: color.onDarkMuted,
    textAlign: 'center',
    marginTop: space.sm,
  },
  item: { flex: 1, alignItems: 'center', gap: 6, minHeight: 44 },
  glyph: { fontSize: 20, color: color.onDark, fontFamily: type.body.fontFamily },
  label: {
    ...type.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: color.onDark,
  },
});
