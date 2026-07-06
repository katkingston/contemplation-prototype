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
import { color, radius, space } from '@/theme/tokens';

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
      <AppText variant="title">Subscription</AppText>
      <Gap size="md" />
      <View
        style={{
          padding: space.md,
          borderRadius: radius.md,
          backgroundColor: color.faint,
          borderWidth: 1,
          borderColor: color.line,
        }}>
        <AppText variant="caption" muted>
          Current plan
        </AppText>
        <AppText variant="bodyBold" testID="current-plan">
          {planLabel}
        </AppText>
        {current?.expiresAt && (
          <AppText variant="small" muted>
            access until {new Date(current.expiresAt).toDateString()}
          </AppText>
        )}
        <AppText variant="caption" muted>
          Prototype: purchases are simulated, no real charges.
        </AppText>
      </View>
      <Gap size="md" />
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
        label="Cancel subscription"
        sub="ends access immediately (mock)"
        danger
        onPress={() => act((s) => s.cancelAccess())}
        testID="cancel-subscription"
      />
      <Gap size="xl" />
      <Button label="Back" kind="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
