/**
 * O6 — Login & Privacy. GATE. Provider-aware:
 * - Local mock (prototype/share URL): email + username, instant account.
 * - Supabase: passwordless email code — enter email → 6-digit code → session.
 *   (No password handling by design, per the approved copy.)
 * Apple/Google arrive with the native build (entitlements/OAuth) — Phase C/D.
 */
import { router } from 'expo-router';
import React, { useState } from 'react';
import { TextInput } from 'react-native';
import { AppText, Button, Gap, Row, Screen } from '@/components/ui';
import { useApp } from '@/services/provider';
import { color, radius, space, type } from '@/theme/tokens';

const inputStyle = {
  ...type.body,
  borderWidth: 1,
  borderColor: color.line,
  borderRadius: radius.sm,
  padding: space.md,
  backgroundColor: color.faint,
  color: color.ink,
} as const;

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
      setError(err instanceof Error ? err.message : 'Could not send the code — try again.');
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
      setError(err instanceof Error ? err.message : 'That code didn’t work — try again.');
    } finally {
      setBusy(false);
    }
  };

  if (cloud && stage === 'code') {
    return (
      <Screen testID="login-code-screen">
        <Gap size="xl" />
        <AppText variant="title">Check your email</AppText>
        <Gap size="sm" />
        <AppText variant="body" muted>
          We sent a 6-digit code to {email.trim()}. Enter it below to finish signing in.
        </AppText>
        <Gap size="lg" />
        <AppText variant="small" muted>
          Code
        </AppText>
        <Gap size="xs" />
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="123456"
          placeholderTextColor={color.muted}
          keyboardType="number-pad"
          maxLength={6}
          style={inputStyle}
          testID="code-input"
        />
        {error ? (
          <>
            <Gap size="sm" />
            <AppText variant="small" style={{ color: color.danger }}>
              {error}
            </AppText>
          </>
        ) : null}
        <Gap size="lg" />
        <Button
          label={busy ? 'Verifying…' : 'Verify'}
          arrow
          onPress={verify}
          disabled={busy || code.trim().length < 6}
          testID="verify-code"
        />
        <Gap size="sm" />
        <Button label="Use a different email" kind="ghost" small onPress={() => setStage('form')} />
      </Screen>
    );
  }

  return (
    <Screen testID="login-screen">
      <Gap size="xl" />
      <AppText variant="title">Log in or sign up</AppText>
      <Gap size="lg" />
      <AppText variant="small" muted>
        Email
      </AppText>
      <Gap size="xs" />
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="name@example.com"
        placeholderTextColor={color.muted}
        autoCapitalize="none"
        keyboardType="email-address"
        style={inputStyle}
        testID="email-input"
      />
      <Gap size="md" />
      <AppText variant="small" muted>
        Username
      </AppText>
      <Gap size="xs" />
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="username"
        placeholderTextColor={color.muted}
        autoCapitalize="none"
        style={inputStyle}
        testID="username-input"
      />
      <Gap size="lg" />
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
        <AppText variant="caption" muted>
          Apple & Google sign-in arrive with the native app build.
        </AppText>
      ) : null}
      <Gap size="lg" />
      <AppText variant="small" muted>
        We never sell or share your data.
      </AppText>
      <AppText variant="small" style={{ color: color.accent, textDecorationLine: 'underline' }}>
        Privacy Policy & Terms ›
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
        label={busy ? 'Sending code…' : cloud ? 'Email me a code' : 'Continue'}
        arrow
        onPress={cloud ? sendCode : () => proceedLocal()}
        disabled={!validForm || busy}
        testID="login-continue"
      />
    </Screen>
  );
}
