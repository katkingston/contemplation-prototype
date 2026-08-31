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
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { ScreenFade } from '@/components/Transitions';
import { color, font, FRAME_HEIGHT, radius, space, type } from '@/theme/tokens';

// ---------- Viewport-proportional anchors ----------

/**
 * The Jul 30 frames pin blocks to a 390x844 grid, but a real phone's WEB
 * viewport runs shorter — iPhone Safari's chrome leaves ~660 of the 844 —
 * which pushed bottom-anchored rows clean off the screen (Kat, Aug 19).
 *
 * Fix: POSITIONS scale with the viewport height; TYPE NEVER SCALES. The
 * returned ax() maps a designed y to this viewport, floored at 75% of the
 * designed spacing (crowding guard) and capped at 110% (very tall screens).
 * At exactly 844 it is the identity, so desktop previews still match Figma
 * to the pixel. The static export pre-renders with a 0-height window — the
 * fallback keeps that render on the designed grid.
 */
export function useAnchor(): (y: number) => number {
  const { height } = useWindowDimensions();
  const h = height || FRAME_HEIGHT;
  const scale = Math.min(1.1, Math.max(0.75, h / FRAME_HEIGHT));
  return (y: number) => Math.round(y * scale);
}

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
  top,
  children,
  style,
  testID,
}: {
  dark?: boolean;
  scroll?: boolean;
  padded?: boolean;
  /** Crisis/support screens set false: help must appear instantly. */
  fade?: boolean;
  /**
   * Measured Figma y for the first block, from the TRUE top of the screen.
   * The Jul 30 frames are 390x844 with the status bar included, so whatever
   * the device already contributes as a safe-area inset is subtracted here —
   * the first block lands on the designed line on web and on device alike.
   */
  top?: number;
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}) {
  const insets = useSafeAreaInsets();
  const ax = useAnchor();
  const bg = { backgroundColor: dark ? color.dark : color.paper };
  const pad = padded ? { paddingHorizontal: space.lg } : null;
  const padTop = top != null ? { paddingTop: Math.max(ax(top) - insets.top, space.sm) } : null;
  return (
    <SafeAreaView style={[styles.flex, bg]} testID={testID}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[pad, padTop, { paddingBottom: space.xxl, flexGrow: 1 }, style]}
          keyboardShouldPersistTaps="handled">
          {fade ? <ScreenFade>{children}</ScreenFade> : children}
        </ScrollView>
      ) : fade ? (
        <ScreenFade style={{ flex: 1 }}>
          <View style={[styles.flex, pad, padTop, style]}>{children}</View>
        </ScreenFade>
      ) : (
        <View style={[styles.flex, pad, padTop, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

// ---------- Measured layout ----------

/**
 * A screen whose blocks sit on measured Figma coordinates instead of stacking.
 * Use it for the fixed compositions — the ones the designs pin to the frame
 * (login, paywall, intake, disclaimer) rather than the ones that grow with
 * their content. Children are `Anchored` / `AnchoredBottom`.
 */
export function Stage({
  dark = false,
  fade = true,
  children,
  style,
  testID,
}: {
  dark?: boolean;
  fade?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}) {
  const bg = { backgroundColor: dark ? color.dark : color.paper };
  const body = <View style={[styles.flex, style]}>{children}</View>;
  return (
    <View style={[styles.flex, bg]} testID={testID}>
      {fade ? <ScreenFade style={styles.flex}>{body}</ScreenFade> : body}
    </View>
  );
}

/**
 * Pins a block to a measured Figma y — offset from the true top of the screen,
 * status bar included, matching how the Jul 30 frames are drawn. On a device
 * the safe-area inset is already part of that offset, so nothing is added.
 */
export function Anchored({
  y,
  gutter = true,
  children,
  style,
}: {
  y: number;
  /** false = full-bleed (hero art, edge-to-edge rules). */
  gutter?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const ax = useAnchor();
  return (
    <View
      style={[
        { position: 'absolute', top: ax(y) },
        gutter ? { left: space.lg, right: space.lg } : { left: 0, right: 0 },
        style,
      ]}>
      {children}
    </View>
  );
}

/** The same, measured up from the bottom edge — see `anchorBottom`. */
export function AnchoredBottom({
  up,
  gutter = true,
  children,
  style,
}: {
  up: number;
  gutter?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const insets = useSafeAreaInsets();
  const ax = useAnchor();
  return (
    <View
      style={[
        { position: 'absolute', bottom: Math.max(ax(up), insets.bottom + space.sm) },
        gutter ? { left: space.lg, right: space.lg } : { left: 0, right: 0 },
        style,
      ]}>
      {children}
    </View>
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
  // DS canon: outline buttons stroke in Dark Sage on light AND dark surfaces.
  const border = kind === 'secondary' ? color.onDarkMuted : 'transparent';
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
        small && styles.buttonHug,
        { backgroundColor: bg, borderColor: border, borderWidth: kind === 'secondary' ? 1 : 0 },
        disabled && { opacity: 0.35 },
        pressed && { opacity: 0.7 },
      ]}>
      <Text
        style={[
          // DS canon: button labels are Inter sentence case 14 (12 small), not bold.
          small ? { ...type.small, fontSize: 12 } : { ...type.body, fontSize: 14 },
          { color: fg, textAlign: 'center' },
        ]}>
        {arrow ? `${label} →` : label}
      </Text>
    </Pressable>
  );
}

// ---------- Wordmark ----------

/** Lowercase brand wordmark — olive on light surfaces, cream on dark (Jul 30 designs). */
export function Wordmark({ dark = false, size = 22 }: { dark?: boolean; size?: number }) {
  return (
    <Text
      accessibilityRole="header"
      style={{
        fontFamily: font.groteskBold,
        fontSize: size,
        lineHeight: Math.round(size * 1.15),
        letterSpacing: -size * 0.02,
        color: dark ? color.onDark : color.accent,
      }}>
      contemplate
    </Text>
  );
}

// ---------- TextLink (underlined action link) ----------

/**
 * Underlined text action — the Jul 30 designs use these in place of many
 * buttons ("Resume, End" · "Skip, Submit" · "Begin"). Primary = bold ink;
 * muted = quiet secondary action.
 */
export function TextLink({
  label,
  onPress,
  dark = false,
  muted = false,
  arrow = false,
  disabled = false,
  small = false,
  center = false,
  testID,
}: {
  label: string;
  onPress?: () => void;
  dark?: boolean;
  muted?: boolean;
  /** Trailing → for forward-motion actions. */
  arrow?: boolean;
  disabled?: boolean;
  /** 12/130% — the player's Crisis Support link (measured off C4). */
  small?: boolean;
  /** Centres the link in its container ("Next question", "Back"). */
  center?: boolean;
  testID?: string;
}) {
  const fg = dark
    ? muted
      ? color.onDarkMuted
      : color.onDark
    : muted
      ? color.muted
      : color.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      hitSlop={10}
      testID={testID}
      style={({ pressed }) => [
        { alignSelf: center ? 'center' : 'flex-start' },
        (pressed || disabled) && { opacity: 0.5 },
      ]}>
      <Text
        style={[
          // Measured: quiet links 15/130%, primary 15/140% -3%.
          muted ? type.bodyLink : type.bodyBold,
          small && { fontSize: 12, lineHeight: 15.6 },
          { color: fg, textDecorationLine: 'underline', textDecorationColor: fg },
        ]}>
        {arrow ? `${label} →` : label}
      </Text>
    </Pressable>
  );
}

// ---------- MonoHeader (contemplation-flow micro-header) ----------

/**
 * Mono caps header row for the contemplation flow: "01.6 — PRECIOUS NOW"
 * left, date right (Jul 30 designs). Pass a precomputed code — never
 * hardcode series length or index.
 */
export function MonoHeader({
  code,
  title,
  date = new Date(),
  dark = false,
  children,
}: {
  code?: string;
  title: string;
  date?: Date;
  dark?: boolean;
  /** Optional second row (e.g. ProgressDots). */
  children?: React.ReactNode;
}) {
  const dateLabel = date
    .toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
    .toUpperCase();
  return (
    <View>
      <Row between>
        <AppText variant="label" dark={dark} muted style={{ flexShrink: 1 }}>
          {code ? `${code} — ${title}` : title}
        </AppText>
        <AppText variant="label" dark={dark} muted>
          {dateLabel}
        </AppText>
      </Row>
      {children ? <View style={{ marginTop: space.sm }}>{children}</View> : null}
    </View>
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

// ---------- Select (dropdown) ----------

/** Dropdown: a field that opens an option sheet. Works on web + native. */
export function Select<T extends string | number>({
  label,
  value,
  options,
  labels,
  onChange,
  testID,
}: {
  label: string;
  value: T;
  options: readonly T[];
  labels?: (v: T) => string;
  onChange: (v: T) => void;
  testID?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const show = (v: T) => (labels ? labels(v) : String(v));
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${show(value)}`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.selectField, pressed && { opacity: 0.7 }]}
        testID={testID}>
        <AppText variant="body">{show(value)}</AppText>
        <AppText variant="small" muted>
          {'\u25be'}
        </AppText>
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)} title={label}>
        {options.map((opt) => {
          const sel = opt === value;
          return (
            <Pressable
              key={String(opt)}
              accessibilityRole="button"
              accessibilityState={{ selected: sel }}
              onPress={() => {
                onChange(opt);
                setOpen(false);
              }}
              style={({ pressed }) => [styles.selectOption, pressed && { opacity: 0.6 }]}>
              <AppText variant={sel ? 'bodyBold' : 'body'}>{show(opt)}</AppText>
              {sel ? <AppText variant="body">{'\u2713'}</AppText> : null}
            </Pressable>
          );
        })}
      </Sheet>
    </>
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
  rightLabel,
  onPress,
  danger = false,
  dark = false,
  arrow = true,
  testID,
}: {
  label: string;
  sub?: string;
  right?: React.ReactNode;
  /** Right-aligned value text before the arrow ("Off" · "6:00 PM" · "Permanent"). */
  rightLabel?: string;
  onPress?: () => void;
  danger?: boolean;
  dark?: boolean;
  /**
   * A2 draws its toggle and time rows with the value alone and no chevron —
   * only the rows that navigate get one.
   */
  arrow?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.listRow,
        dark && { borderTopColor: 'rgba(251,251,246,0.25)' },
        pressed && { opacity: 0.6 },
      ]}>
      <View style={styles.flex}>
        <AppText variant="bodyBold" dark={dark} style={danger ? { color: color.danger } : undefined}>
          {label}
        </AppText>
        {sub ? (
          <AppText variant="small" muted dark={dark}>
            {sub}
          </AppText>
        ) : null}
      </View>
      {rightLabel ? (
        <AppText variant="body" dark={dark} muted>
          {rightLabel}
        </AppText>
      ) : null}
      {right ??
        (onPress && arrow ? (
          <AppText variant="body" dark={dark} muted>
            {'→'}
          </AppText>
        ) : null)}
    </Pressable>
  );
}

// ---------- Step dots ----------

export function Dots({ count, active, dark = false }: { count: number; active: number; dark?: boolean }) {
  // Advancement reads through COLOUR only — the active dot stays a circle,
  // never stretching into a pill (Kat, Aug 18).
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
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
  tone = 'paper',
  showClose = true,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  /** 'overlay' = taupe dialog card on a taupe scrim (rating prompt, Jul 30 designs). */
  tone?: 'paper' | 'overlay';
  /** Set false when the content renders its own actions. */
  showClose?: boolean;
  children: React.ReactNode;
}) {
  const overlay = tone === 'overlay';
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.sheetBackdrop, overlay && { backgroundColor: 'transparent' }]}
        onPress={onClose}
        accessibilityLabel="Close pop-up">
        {overlay ? (
          // Same treatment as the paused contemplation: blur what's behind,
          // then wash it in the taupe overlay tone.
          <>
            <BlurView
              intensity={30}
              tint="default"
              experimentalBlurMethod="dimezisBlurView"
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(168,159,140,0.6)' }]}
              pointerEvents="none"
            />
          </>
        ) : null}
        <Pressable
          style={[styles.sheetCard, overlay && styles.sheetCardOverlay]}
          onPress={(e) => e.stopPropagation()}>
          <ScrollView contentContainerStyle={{ padding: space.lg }}>
            {title ? (
              overlay ? (
                <AppText variant="monoBody" dark style={{ marginBottom: space.md }}>
                  {title}
                </AppText>
              ) : (
                <AppText variant="heading" style={{ marginBottom: space.md }}>
                  {title}
                </AppText>
              )
            ) : null}
            {children}
            {showClose ? (
              <View style={{ marginTop: space.lg }}>
                <Button label="Close" kind="ghost" dark={overlay} onPress={onClose} />
              </View>
            ) : null}
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
    // Jul 30 designs: full-width rectangular CTAs, squared corners.
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  buttonHug: { alignSelf: 'flex-start' },
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
    // Measured off A1/A2/A3: rows sit on a 48pt pitch (192, 240, 288, 336,
    // 384) with a hairline rule above each. A 15/21 label centred in 48 leaves
    // 13.5 either side — do not round this to 14, the drift compounds down the
    // list. Rows that carry a `sub` grow past the pitch by design.
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: 13.25,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.muted,
  },
  dotsRow: { flexDirection: 'row', gap: 6, alignSelf: 'center', alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4 },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: space.lg,
  },
  sheetCard: {
    backgroundColor: color.paper,
    borderRadius: radius.md,
    maxHeight: '85%',
  },
  sheetCardOverlay: { backgroundColor: color.overlayElevated },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: space.md,
    backgroundColor: color.faint,
    minHeight: 44,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.line,
  },
});
