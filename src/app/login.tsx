/**
 * O6 — Login & Privacy. GATE.
 * Prototype: local mock auth (email + username). Apple/Google buttons render
 * but create the same local profile — real SSO arrives with the Supabase
 * adapter (needs entitlements/OAuth config). No password handling by design.
 */
import { router } from 'expo-router';
import React, { useState } from 'react';
import { TextInput } from 'react-native';
import { AppText, Button, Gap, Row, Screen } from '@/components/ui';
import { useApp } from '@/services/provider';
import { color, radius, space, type } from '@/theme/tokens';

export default function Login() {
  const { act } = useApp();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  const valid = /.+@.+\..+/.test(email.trim()) && username.trim().length >= 2;

  const create = async (provider?: 'apple' | 'google') => {
    const e = provider ? `${provider}-user@example.com` : email.trim();
    const u = username.trim() || (provider ? `${provider}_user` : '');
    await act(async (s) => {
      await s.createAccount(e, u || 'contemplator');
      await s.setOnboardingStep('intake');
    });
    router.replace('/baseline-intro');
  };

  const inputStyle = {
    ...type.body,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.sm,
    padding: space.md,
    backgroundColor: color.faint,
    color: color.ink,
  };

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
        <Button label="Apple" kind="secondary" onPress={() => create('apple')} />
        <Button label="Google" kind="secondary" onPress={() => create('google')} />
      </Row>
      <Gap size="lg" />
      <AppText variant="small" muted>
        We never sell or share your data.
      </AppText>
      <AppText variant="small" style={{ color: color.accent, textDecorationLine: 'underline' }}>
        Privacy Policy & Terms ›
      </AppText>
      <Gap size="xl" />
      <Button label="Continue" onPress={() => create()} disabled={!valid} testID="login-continue" />
    </Screen>
  );
}
