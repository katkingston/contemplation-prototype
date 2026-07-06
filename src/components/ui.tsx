/**
 * Core UI kit. Deliberately neutral/low-fi: every visual decision routes
 * through theme tokens so the final design pass is centralized.
 */
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenFade } from '@/components/Transitions';
import { color, radius, space, type } from '@/theme/tokens';

// ---------- Text ----------

type TypeVariant = keyof typeof type;

export function AppText({
  variant = 'body',
  dark = false,
  muted = false,
  center = false,
  style,
  children,
  ...rest
}: React.ComponentProps<typeof Text> & {
  variant?: TypeVariant;
  dark?: boolean;
  muted?: boolean;
  center?: boolean;
}) {
  const base = type[variant] as TextStyle;
  const colorStyle: TextStyle = {
    color: dark ? (muted ? color.onDarkMuted : color.onDark) : muted ? color.muted : color.ink,
  };
  return (
    <Text
      {...rest}
      style={[base, colorStyle, center && { textAlign: 'center' }, style]}>
      {children}
    </Text>
  );
}

// ---------- Screen ----------

export function Screen({
  dark = false,
  scroll = true,
  padded = true,
  fade = true,
  children,
  style,
  testID,
}: {
  dark?: boolean;
  scroll?: boolean;
  padded?: boolean;
  /** Crisis/support screens set false: help must appear instantly. */
  fade?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}) {
  const bg = { backgroundColor: dark ? color.dark : color.paper };
  const pad = padded ? { paddingHorizontal: space.lg } : null;
  return (
    <SafeAreaView style={[styles.flex, bg]} testID={testID}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[pad, { paddingBottom: space.xxl, flexGrow: 1 }, style]}
          keyboardShouldPersistTaps="handled">
          {fade ? <ScreenFade>{children}</ScreenFade> : children}
        </ScrollView>
      ) : fade ? (
        <ScreenFade style={{ flex: 1 }}>
          <View style={[styles.flex, pad, style]}>{children}</View>
        </ScreenFade>
      ) : (
        <View style={[styles.flex, pad, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

// ---------- Button ----------

export function Button({
  label,
  onPress,
  kind = 'primary',
  dark = false,
  disabled = false,
  small = false,
  arrow = false,
  testID,
}: {
  label: string;
  onPress?: () => void;
  kind?: 'primary' | 'secondary' | 'ghost' | 'danger';
  dark?: boolean;
  disabled?: boolean;
  small?: boolean;
  /** Open-style trailing arrow for forward-motion CTAs. */
  arrow?: boolean;
  testID?: string;
}) {
  const bg =
    kind === 'primary'
      ? dark
        ? color.paper
        : color.ink
      : 'transparent';
  const border =
    kind === 'secondary' ? (dark ? color.onDarkMuted : color.ink) : 'transparent';
  const fg =
    kind === 'primary'
      ? dark
        ? color.ink
        : color.paper
      : kind === 'danger'
        ? color.danger
        : kind === 'ghost'
          ? dark
            ? color.onDarkMuted
            : color.muted
          : dark
            ? color.onDark
            : color.ink;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={small ? 10 : undefined}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: bg, borderColor: border, borderWidth: kind === 'secondary' ? 1.5 : 0 },
        disabled && { opacity: 0.35 },
        pressed && { opacity: 0.7 },
      ]}>
      <Text
        style={[
          small ? type.small : type.bodyBold,
          { color: fg, textAlign: 'center' },
        ]}>
        {arrow ? `${label} →` : label}
      </Text>
    </Pressable>
  );
}

// ---------- Eyebrow (Open-style section label) ----------

/** Hairline rule + small caps label marking the start of a section. */
export function Eyebrow({ children, dark = false }: { children: string; dark?: boolean }) {
  return (
    <View
      style={{
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: dark ? color.onDarkMuted : color.line,
        paddingTop: space.sm,
        marginTop: space.xl,
        marginBottom: space.md,
      }}>
      <AppText variant="label" muted dark={dark}>
        {children}
      </AppText>
    </View>
  );
}

// ---------- Chips ----------

export function ChipGroup<T extends string | number>({
  options,
  value,
  onChange,
  dark = false,
  labels,
}: {
  options: readonly T[];
  value: T | null;
  onChange: (v: T) => void;
  dark?: boolean;
  labels?: (v: T) => string;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((opt) => {
        const sel = value === opt;
        return (
          <Pressable
            key={String(opt)}
            accessibilityRole="button"
            accessibilityState={{ selected: sel }}
            onPress={() => onChange(opt)}
            style={[
              styles.chip,
              sel
                ? { backgroundColor: dark ? color.paper : color.ink }
                : { borderColor: dark ? color.onDarkMuted : color.line, borderWidth: 1 },
            ]}>
            <Text
              style={[
                type.small,
                {
                  color: sel
                    ? dark
                      ? color.ink
                      : color.paper
                    : dark
                      ? color.onDark
                      : color.ink,
                },
              ]}>
              {labels ? labels(opt) : String(opt)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Multi-select variant. */
export function MultiChipGroup({
  options,
  values,
  onToggle,
}: {
  options: readonly string[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((opt) => {
        const sel = values.includes(opt);
        return (
          <Pressable
            key={opt}
            accessibilityRole="button"
            accessibilityState={{ selected: sel }}
            onPress={() => onToggle(opt)}
            style={[
              styles.chip,
              sel
                ? { backgroundColor: color.ink }
                : { borderColor: color.line, borderWidth: 1 },
            ]}>
            <Text style={[type.small, { color: sel ? color.paper : color.ink }]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------- List row ----------

export function StatusPill({
  label,
  kind = 'neutral',
}: {
  label: string;
  kind?: 'done' | 'progress' | 'locked' | 'neutral';
}) {
  const map = {
    done: { fg: color.success, bg: color.successBg },
    progress: { fg: color.progress, bg: color.progressBg },
    locked: { fg: color.locked, bg: color.faint },
    neutral: { fg: color.accent, bg: color.faint },
  }[kind];
  return (
    <View style={[styles.statusPill, { backgroundColor: map.bg }]}>
      <Text style={[type.label, { color: map.fg }]}>{label}</Text>
    </View>
  );
}

export function ListRow({
  label,
  sub,
  right,
  onPress,
  danger = false,
  testID,
}: {
  label: string;
  sub?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.listRow, pressed && { opacity: 0.6 }]}>
      <View style={styles.flex}>
        <AppText variant="bodyBold" style={danger ? { color: color.danger } : undefined}>
          {label}
        </AppText>
        {sub ? (
          <AppText variant="small" muted>
            {sub}
          </AppText>
        ) : null}
      </View>
      {right ?? (onPress ? <AppText variant="body" muted>{'›'}</AppText> : null)}
    </Pressable>
  );
}

// ---------- Step dots ----------

export function Dots({ count, active, dark = false }: { count: number; active: number; dark?: boolean }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === active && styles.dotActive,
            {
              backgroundColor:
                i === active ? (dark ? color.onDark : color.ink) : dark ? color.onDarkMuted : color.line,
            },
          ]}
        />
      ))}
    </View>
  );
}

// ---------- Sheet (pop-up) ----------

export function Sheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} accessibilityLabel="Close pop-up">
        <Pressable style={styles.sheetCard} onPress={(e) => e.stopPropagation()}>
          <ScrollView contentContainerStyle={{ padding: space.lg }}>
            {title ? (
              <AppText variant="heading" style={{ marginBottom: space.md }}>
                {title}
              </AppText>
            ) : null}
            {children}
            <View style={{ marginTop: space.lg }}>
              <Button label="Close" kind="ghost" onPress={onClose} />
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------- Layout helpers ----------

export function Gap({ size = 'md' }: { size?: keyof typeof space }) {
  return <View style={{ height: space[size] }} />;
}

export function Spacer() {
  return <View style={styles.flex} />;
}

export function Row({
  children,
  between = false,
  style,
}: {
  children: React.ReactNode;
  between?: boolean;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: space.sm },
        between && { justifyContent: 'space-between' },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  button: {
    // Open-style: hug-content, left-aligned; squared corners per Kat.
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  buttonSmall: { paddingVertical: 7, paddingHorizontal: space.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
  },
  statusPill: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.line,
  },
  dotsRow: { flexDirection: 'row', gap: 6, alignSelf: 'center', alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotActive: { width: 18 },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: space.lg,
  },
  sheetCard: {
    backgroundColor: color.paper,
    borderRadius: radius.lg,
    maxHeight: '85%',
  },
});
