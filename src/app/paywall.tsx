/**
 * O5 — Paywall (Jul 30 designs): light screen — wordmark, mono value
 * statement, three hairline plan rows (selected row shaded, Annual carries a
 * boxed Save tag), then "Start with 3 days free" + note + full-width CTA.
 * MOCK purchases: selecting a plan + Start free trial writes a local access
 * grant. Real RevenueCat wiring replaces the grant call only (see AccessService
 * notes in services/supabase + App-CLAUDE.md payments rules).
 */
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Button, Gap, Screen, Spacer, Wordmark } from '@/components/ui';
import { paywall, plans, ProductType } from '@/content/copy';
import { orderedSeries } from '@/content/series';
import { useApp } from '@/services/provider';
import { color, space } from '@/theme/tokens';

export default function Paywall() {
  const { act } = useApp();
  const [selected, setSelected] = useState<ProductType>('annual');

  const purchase = async () => {
    const introSeries = orderedSeries()[0];
    const ok = await act(async (s) => {
      // MOCK purchase — no real charge. Series pack scopes to the intro series.
      await s.grantAccess(selected, selected === 'series_pack' ? introSeries.id : null);
      await s.setOnboardingStep('login');
    });
    if (ok) router.replace('/login');
  };

  return (
    <Screen testID="paywall-screen">
      <Gap size="lg" />
      <Wordmark />
      <Gap size="xl" />
      <AppText variant="monoBody" style={{ maxWidth: 320 }}>
        {paywall.subhead}
      </AppText>
      <Gap size="xl" />
      {plans.map((p) => {
        const sel = selected === p.productType;
        return (
          <Pressable
            key={p.productType}
            accessibilityRole="button"
            accessibilityState={{ selected: sel }}
            onPress={() => setSelected(p.productType)}
            style={[styles.plan, sel && styles.planSelected]}
            testID={`plan-${p.productType}`}>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <AppText variant="bodyBold">{p.title}</AppText>
                {p.badge ? (
                  <View style={styles.badge}>
                    <AppText variant="label" muted>
                      {p.badge}
                    </AppText>
                  </View>
                ) : null}
              </View>
              <AppText variant="small" muted>
                {p.detail}
              </AppText>
            </View>
            <AppText variant="body">{p.price}</AppText>
          </Pressable>
        );
      })}
      <View style={styles.endRule} />
      <Spacer />
      <Gap size="xl" />
      <AppText variant="titleLower" style={{ fontSize: 22, lineHeight: 27 }}>
        {paywall.trialTitle}
      </AppText>
      <Gap size="sm" />
      <AppText variant="caption" muted>
        {paywall.trialNote}
      </AppText>
      <Gap size="sm" />
      <AppText variant="caption" muted>
        Prototype: purchases are simulated — no charge of any kind.
      </AppText>
      <Gap size="md" />
      <Button label={paywall.cta} arrow onPress={purchase} testID="start-trial" />
      <Gap size="lg" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.muted,
  },
  planSelected: { backgroundColor: color.faint },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  badge: {
    borderWidth: 1,
    borderColor: color.muted,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  endRule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.muted },
});
