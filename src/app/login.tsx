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
import { AppText, Button, Gap, Row, Screen, Wordmark } from '@/components/ui';
import { useApp } from '@/services/provider';
import { color, font, space, type } from '@/theme/tokens';

const inputStyle = {
  ...type.body,
  borderBottomWidth: 1,
  borderBottomColor: color.muted,
  paddingVertical: space.sm,
  color: color.ink,
} as const;

const CODE_LENGTH = 6;

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
      <Screen testID="login-code-screen">
        <Gap size="lg" />
        <Wordmark />
        <Gap size="xxl" />
        <Gap size="xl" />
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

  return (
    <Screen testID="login-screen">
      <Gap size="lg" />
      <Wordmark />
      <Gap size="xxl" />
      <AppText variant="titleLower">Log in or sign up</AppText>
      <Gap size="xl" />
      <AppText variant="label" muted>
        Email
      </AppText>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="name@example.com"
        accessibilityLabel="Email address"
        placeholderTextColor={color.muted}
        autoCapitalize="none"
        keyboardType="email-address"
        style={inputStyle}
        testID="email-input"
      />
      <Gap size="lg" />
      <AppText variant="label" muted>
        Username
      </AppText>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="How should we address you?"
        accessibilityLabel="Username"
        placeholderTextColor={color.muted}
        autoCapitalize="none"
        style={inputStyle}
        testID="username-input"
      />
      <Gap size="xl" />
      <Row>
        <Button
          label="Apple"
          kind="secondary"
          onPress={cloud ? undefined : () => proceedLocal('apple')}
          disabled={cloud}
        />
        <Button
          label="Google"
          kind="secondary"
          onPress={cloud ? undefined : () => proceedLocal('google')}
          disabled={cloud}
        />
      </Row>
      {cloud ? (
        <>
          <Gap size="sm" />
          <AppText variant="caption" muted>
            Apple & Google sign-in arrive with the native app build.
          </AppText>
        </>
      ) : null}
      <Gap size="xl" />
      <AppText variant="small" muted>
        We never sell or share your data.
      </AppText>
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
      <Gap size="xl" />
      <Button
        label={busy ? 'Sending code…' : cloud ? 'Email Code' : 'Continue'}
        arrow
        onPress={cloud ? sendCode : () => proceedLocal()}
        disabled={!validForm || busy}
        testID="login-continue"
      />
      <Gap size="lg" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  codeRow: { flexDirection: 'row', gap: space.sm },
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
