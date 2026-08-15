/**
 * O6 — Login & Privacy. GATE. Provider-aware:
 * - Local mock (prototype/share URL): email + username, instant account.
 * - Supabase: passwordless email code — enter email → 6-digit code → session.
 *   (No password handling by design, per the approved copy.)
 * Apple/Google arrive with the native build (entitlements/OAuth) — Phase C/D.
 * Jul 30 designs: wordmark header, mono caps field labels over underline
 * inputs, outlined SSO pair, "Email Code →" CTA, and a 6-box code screen.
 */
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import {
  Anchored,
  AnchoredBottom,
  AppText,
  Button,
  Gap,
  Screen,
  Stage,
  Wordmark,
} from '@/components/ui';
import { useApp } from '@/services/provider';
import { anchor, anchorBottom, color, font, radius, space, type } from '@/theme/tokens';

/**
 * Measured off O6: label top 349, value 367, underline 391 — so the label box
 * is 16, then a 2px gap, then a 24-tall value sitting on the rule. The second
 * field repeats it 76 lower.
 */
const inputStyle = {
  ...type.body,
  height: 24,
  paddingVertical: 0,
  borderBottomWidth: 1,
  borderBottomColor: color.muted,
  color: color.ink,
} as const;

const FIELD_PITCH = 76;

const CODE_LENGTH = 6;

/** Outlined SSO pair — 49 tall, hugging their labels (O6: 85 and 93 wide). */
function SsoButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.sso, (pressed || disabled) && { opacity: 0.5 }]}>
      <AppText variant="body" style={{ fontSize: 14 }}>
        {label}
      </AppText>
    </Pressable>
  );
}

/** Mono caps label over an underlined input (O6). */
function Field({
  label,
  ...input
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <>
      <AppText variant="fieldLabel" muted>
        {label}
      </AppText>
      <View style={{ height: 2 }} />
      <TextInput placeholderTextColor={color.muted} style={inputStyle} {...input} />
    </>
  );
}

/** Six visible digit boxes fed by one invisible input (Jul 30 designs). */
function CodeBoxes({
  value,
  onChange,
  testID,
}: {
  value: string;
  onChange: (v: string) => void;
  testID?: string;
}) {
  const inputRef = useRef<TextInput>(null);
  return (
    <Pressable
      accessibilityLabel="Six digit code"
      onPress={() => inputRef.current?.focus()}
      style={styles.codeRow}>
      {Array.from({ length: CODE_LENGTH }, (_, i) => (
        <View key={i} style={[styles.codeBox, i === value.length && styles.codeBoxActive]}>
          <AppText variant="bodyBold" style={{ fontFamily: font.mono } as never}>
            {value[i] ?? ''}
          </AppText>
        </View>
      ))}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, CODE_LENGTH))}
        keyboardType="number-pad"
        maxLength={CODE_LENGTH}
        autoFocus
        style={styles.codeInput}
        testID={testID}
      />
    </Pressable>
  );
}

export default function Login() {
  const { services, act, refresh } = useApp();
  const cloud = Boolean(services.requestEmailCode);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'form' | 'code'>('form');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validForm = /.+@.+\..+/.test(email.trim()) && username.trim().length >= 2;

  const proceedLocal = async (provider?: 'apple' | 'google') => {
    const e = provider ? `${provider}-user@example.com` : email.trim();
    const u = username.trim() || (provider ? `${provider}_user` : 'contemplator');
    const ok = await act(async (s) => {
      await s.createAccount(e, u);
      await s.setOnboardingStep('intake');
    });
    if (ok) router.replace('/baseline-intro');
  };

  const sendCode = async () => {
    setBusy(true);
    setError(null);
    try {
      await services.requestEmailCode!(email.trim());
      setStage('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the code. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    try {
      await services.verifyEmailCode!(email.trim(), code.trim(), username.trim());
      const fresh = await services.loadAll();
      await refresh();
      // Returning users land on Home with their data; only new users take intake.
      router.replace(fresh.onboardingStep === 'done' ? '/home' : '/baseline-intro');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That code didn’t work. Try again.');
    } finally {
      setBusy(false);
    }
  };

  if (cloud && stage === 'code') {
    return (
      <Screen testID="login-code-screen" top={anchor.wordmark}>
        <Wordmark />
        <View style={{ height: anchor.formTitle - anchor.wordmark - 25 }} />
        <AppText variant="titleLower">Check your email</AppText>
        <Gap size="md" />
        <AppText variant="body" muted>
          We sent a 6-digit code to {email.trim()}.
        </AppText>
        <Gap size="xl" />
        <CodeBoxes value={code} onChange={setCode} testID="code-input" />
        {error ? (
          <>
            <Gap size="sm" />
            <AppText variant="small" style={{ color: color.danger }}>
              {error}
            </AppText>
          </>
        ) : null}
        <Gap size="xxl" />
        <Button
          label="Use a different email"
          kind="secondary"
          onPress={() => setStage('form')}
        />
        <Gap size="sm" />
        <Button
          label={busy ? 'Verifying…' : 'Verify'}
          arrow
          onPress={verify}
          disabled={busy || code.trim().length < CODE_LENGTH}
          testID="verify-code"
        />
        <Gap size="lg" />
      </Screen>
    );
  }

  // O6 pins every block to the frame: wordmark 72, title 241, fields 349 and
  // 425, SSO pair 496, privacy 612, CTA 729. Anchored, not stacked.
  return (
    <Stage testID="login-screen">
      <Anchored y={anchor.wordmark}>
        <Wordmark />
      </Anchored>
      <Anchored y={anchor.formTitle}>
        <AppText variant="titleLower">Log in or sign up</AppText>
      </Anchored>
      <Anchored y={349}>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
          accessibilityLabel="Email address"
          autoCapitalize="none"
          keyboardType="email-address"
          testID="email-input"
        />
      </Anchored>
      <Anchored y={349 + FIELD_PITCH}>
        <Field
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="How should we address you?"
          accessibilityLabel="Username"
          autoCapitalize="none"
          testID="username-input"
        />
      </Anchored>
      <Anchored y={496} style={styles.ssoRow}>
        <SsoButton
          label="Apple"
          onPress={cloud ? undefined : () => proceedLocal('apple')}
          disabled={cloud}
        />
        <SsoButton
          label="Google"
          onPress={cloud ? undefined : () => proceedLocal('google')}
          disabled={cloud}
        />
      </Anchored>
      <Anchored y={612}>
        <AppText variant="small" muted>
          {cloud
            ? 'Apple & Google sign-in arrive with the native app build.'
            : 'We never sell or share your data.'}
        </AppText>
        <View style={{ height: 9 }} />
        <AppText variant="small" style={{ color: color.accent, textDecorationLine: 'underline' }}>
          Privacy Policy + Terms ›
        </AppText>
        {error ? (
          <>
            <Gap size="sm" />
            <AppText variant="small" style={{ color: color.danger }}>
              {error}
            </AppText>
          </>
        ) : null}
      </Anchored>
      <AnchoredBottom up={anchorBottom.action}>
        <Button
          label={busy ? 'Sending code…' : cloud ? 'Email Code' : 'Continue'}
          arrow
          onPress={cloud ? sendCode : () => proceedLocal()}
          disabled={!validForm || busy}
          testID="login-continue"
        />
      </AnchoredBottom>
    </Stage>
  );
}

const styles = StyleSheet.create({
  codeRow: { flexDirection: 'row', gap: space.sm },
  ssoRow: { flexDirection: 'row', gap: space.sm },
  sso: {
    height: 49,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: color.onDarkMuted,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBox: {
    width: 44,
    height: 52,
    borderWidth: 1,
    borderColor: color.muted,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.paper,
  },
  codeBoxActive: { borderColor: color.ink, borderWidth: 1.5 },
  codeInput: { ...StyleSheet.absoluteFillObject, opacity: 0.01 },
});
