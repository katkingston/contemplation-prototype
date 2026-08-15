/**
 * A3 — Subscription Management: current plan, upgrade, restore, cancel.
 * MOCK: grants live in local storage. Real RevenueCat replaces grant writes;
 * cancel/restore become store-managed flows.
 */
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Gap, ListRow, Screen, Spacer, TextLink } from '@/components/ui';
import { plans } from '@/content/copy';
import { useApp } from '@/services/provider';
import { anchor, space } from '@/theme/tokens';

export default function Subscription() {
  const { data, act } = useApp();
  const now = Date.now();
  const active = data.grants.filter(
    (g) => g.expiresAt == null || new Date(g.expiresAt).getTime() > now,
  );
  const current = active[active.length - 1] ?? null;
  const planLabel = current
    ? (plans.find((p) => p.productType === current.productType)?.title ?? current.productType)
    : 'No active plan';

  const price = current
    ? (plans.find((p) => p.productType === current.productType)?.price ?? '')
    : '';

  // A3: title 66, "Member since" 108, then rows from 192. Current Plan carries
  // its plan and price as a right-hand column with the renewal date beneath.
  return (
    <Screen testID="subscription-screen" top={anchor.pageTitle}>
      <AppText variant="titleLower">Subscription</AppText>
      {data.profile ? (
        <AppText variant="small" muted style={{ marginTop: 11 }}>
          Member since{' '}
          {new Date(data.profile.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </AppText>
      ) : null}
      <View style={{ height: 51 }} />
      <ListRow
        label="Current Plan"
        arrow={false}
        right={
          <View style={styles.planColumn}>
            <AppText variant="small" muted>
              {current ? `${planLabel}   ${price}` : 'None'}
            </AppText>
            {current?.expiresAt ? (
              <AppText variant="small" muted>
                {new Date(current.expiresAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </AppText>
            ) : null}
          </View>
        }
        testID="current-plan"
      />
      <ListRow label="Upgrade" onPress={() => router.push('/paywall')} testID="upgrade-plan" />
      {/* Not in A3, but the App Store requires a restore path for IAP. */}
      <ListRow
        label="Restore purchase"
        onPress={() => current && void act((s) => s.grantAccess(current.productType, current.seriesId ?? null))}
        testID="restore-purchase"
      />
      <ListRow
        label="Cancel Subscription"
        danger
        onPress={() => act((s) => s.cancelAccess())}
        testID="cancel-subscription"
      />
      <AppText variant="small" muted style={{ marginTop: space.md }}>
        Cancelling keeps access until the period ends. (Prototype: purchases are
        simulated with no real charges, and cancelling ends access immediately.)
      </AppText>
      <Spacer />
      <Gap size="xl" />
      <TextLink label="Back" center muted onPress={() => router.back()} />
      <Gap size="xl" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  planColumn: { alignItems: 'flex-end' },
});
