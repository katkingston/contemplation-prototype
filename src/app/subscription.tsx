/**
 * A3 — Subscription Management: current plan, upgrade, restore, cancel.
 * MOCK: grants live in local storage. Real RevenueCat replaces grant writes;
 * cancel/restore become store-managed flows.
 */
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { AppText, Button, Gap, ListRow, Screen } from '@/components/ui';
import { plans } from '@/content/copy';
import { orderedSeries } from '@/content/series';
import { useApp } from '@/services/provider';
import { space } from '@/theme/tokens';

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

  const buy = async (productType: (typeof plans)[number]['productType']) => {
    const intro = orderedSeries()[0];
    await act((s) => s.grantAccess(productType, productType === 'series_pack' ? intro.id : null));
  };

  return (
    <Screen testID="subscription-screen">
      <Gap size="xl" />
      <AppText variant="titleLower">Subscription</AppText>
      {data.profile ? (
        <AppText variant="small" muted>
          Member since{' '}
          {new Date(data.profile.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </AppText>
      ) : null}
      <Gap size="xl" />
      <ListRow
        label="Current Plan"
        rightLabel={
          current
            ? `${planLabel}  ${plans.find((p) => p.productType === current.productType)?.price ?? ''}`
            : 'None'
        }
        right={<View />}
        testID="current-plan"
      />
      {current?.expiresAt ? (
        <AppText variant="small" muted>
          Access until {new Date(current.expiresAt).toLocaleDateString()}
        </AppText>
      ) : null}
      <Gap size="lg" />
      {plans.map((p) => (
        <ListRow
          key={p.productType}
          label={`Upgrade to ${p.title}`}
          sub={`${p.price} — ${p.detail}`}
          onPress={() => buy(p.productType)}
          testID={`buy-${p.productType}`}
        />
      ))}
      <ListRow
        label="Restore purchase"
        sub="re-applies your latest plan"
        onPress={() => current && buy(current.productType)}
      />
      <ListRow
        label="Cancel Subscription"
        danger
        onPress={() => act((s) => s.cancelAccess())}
        testID="cancel-subscription"
      />
      <AppText variant="small" muted style={{ marginTop: space.sm }}>
        Cancelling keeps access until the period ends. (Prototype: purchases are
        simulated with no real charges, and cancelling ends access immediately.)
      </AppText>
      <Gap size="xl" />
      <Button label="Back" kind="secondary" onPress={() => router.back()} />
      <Gap size="lg" />
    </Screen>
  );
}
