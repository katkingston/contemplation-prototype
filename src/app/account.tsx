/**
 * A1 — Account (Jul 30 designs): identity header (name + email), hairline
 * utility rows — Subscription / Settings / Mental health resources / Sign out
 * / Send feedback — and a centered wordmark + daily-quote footer.
 * (Badges and the guest pass were removed with the Jul 30 redesign; practice
 * stats live on the Journey page now.)
 */
import { router } from 'expo-router';
import { Linking } from 'react-native';
import React from 'react';
import { View } from 'react-native';
import { TabScreen } from '@/components/BottomNav';
import { AppText, ListRow, useAnchor } from '@/components/ui';
import { dailyQuote } from '@/content/copy';
import { useApp } from '@/services/provider';

const FEEDBACK_MAILTO = 'mailto:support@deathtination.io?subject=Contemplate%20feedback';

export default function Account() {
  const { data, services, act } = useApp();
  const ax = useAnchor();
  const username = data.profile?.username || 'you';
  const firstName = username.charAt(0).toUpperCase() + username.slice(1);

  const signOut = async () => {
    if (!(await act(async (s) => s.signOut && (await s.signOut()))))
      return; // sign-out failed — stay put, notice explains
    router.dismissAll?.();
    router.replace('/signed-out' as never);
  };

  // Current plan, from the newest active grant (mock until RevenueCat).
  const now = Date.now();
  const activeGrant = [...data.grants]
    .filter((g) => g.expiresAt == null || new Date(g.expiresAt).getTime() > now)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))[0];
  const subscriptionRight = activeGrant?.expiresAt
    ? `Access until ${new Date(activeGrant.expiresAt).toLocaleDateString()}`
    : activeGrant
      ? 'Active'
      : 'Choose a plan';

  // A1: name 72, email 108, rows from 192 on the 48pt pitch — spacers scale
  // with the viewport like every other screen (Kat, Aug 19).
  return (
    <TabScreen active="account">
      <View style={{ height: ax(72) }} />
      <AppText variant="titleLower">{firstName}</AppText>
      <AppText variant="small" muted style={{ marginTop: 5 }}>
        {data.profile?.email ?? `@${username}`}
      </AppText>
      <View style={{ height: ax(51) }} />
      <ListRow
        label="Subscription"
        rightLabel={subscriptionRight}
        onPress={() => router.push('/subscription')}
        testID="account-subscription"
      />
      <ListRow label="Settings" onPress={() => router.push('/settings')} testID="account-settings" />
      <ListRow
        label="Mental health resources"
        onPress={() => router.push('/resources')}
        testID="account-resources"
      />
      {services.signOut ? <ListRow label="Sign out" onPress={signOut} testID="account-signout" /> : null}
      <ListRow
        label="Send feedback"
        onPress={() => void Linking.openURL(FEEDBACK_MAILTO)}
        testID="account-feedback"
      />
      <View style={{ flexGrow: 1, minHeight: ax(48) }} />
      {/* A1 closes on the daily quote alone (596) with its attribution in mono
          caps beneath. "Member since" lives on A3 Subscription, not here. */}
      <View style={{ alignItems: 'center' }}>
        <AppText variant="monoBody" muted center style={{ maxWidth: 300 }}>
          “{dailyQuote().text}”
        </AppText>
        <View style={{ height: ax(20) }} />
        <AppText variant="label" muted center>
          {dailyQuote().by}
        </AppText>
      </View>
      <View style={{ height: ax(40) }} />
    </TabScreen>
  );
}
