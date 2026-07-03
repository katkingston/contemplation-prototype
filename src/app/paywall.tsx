/**
 * O5 — Benefits & Plan over an ambient background.
 * MOCK purchases: selecting a plan + Start free trial writes a local access
 * grant. Real RevenueCat wiring replaces the grant call only (see AccessService
 * notes in services/supabase + App-CLAUDE.md payments rules).
 */
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Button, Gap } from '@/components/ui';
import { paywall, plans, ProductType } from '@/content/copy';
import { orderedSeries } from '@/content/series';
import { useApp } from '@/services/provider';
import { radius, space } from '@/theme/tokens';

export default function Paywall() {
  const { act } = useApp();
  const [selected, setSelected] = useState<ProductType>('annual');

  const purchase = async () => {
    const introSeries = orderedSeries()[0];
    await act(async (s) => {
      // MOCK purchase — no real charge. Series pack scopes to the intro series.
      await s.grantAccess(selected, selected === 'series_pack' ? introSeries.id : null);
      await s.setOnboardingStep('login');
    });
    router.replace('/login');
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#221c16', '#4c5232']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.content}>
        <Gap size="xl" />
        <AppText variant="title" dark>
          {paywall.headline}
        </AppText>
        <Gap size="sm" />
        <AppText variant="body" dark muted>
          {paywall.subhead}
        </AppText>
        <Gap size="xl" />
        <AppText variant="heading" dark>
          {paywall.trialTitle}
        </AppText>
        <Gap size="md" />
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
                <AppText variant="bodyBold" dark>
                  {p.title}
                </AppText>
                <AppText variant="small" dark muted>
                  {p.detail}
                </AppText>
              </View>
              <AppText variant="bodyBold" dark>
                {p.price}
              </AppText>
            </Pressable>
          );
        })}
        <Gap size="md" />
        <AppText variant="caption" dark muted>
          {paywall.trialNote}
        </AppText>
        <View style={{ flex: 1 }} />
        <AppText variant="caption" dark muted center>
          Prototype: purchases are simulated — no charge of any kind.
        </AppText>
        <Gap size="sm" />
        <Button label={paywall.cta} dark arrow onPress={purchase} testID="start-trial" />
        <Gap size="lg" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, paddingHorizontal: space.lg },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(239,233,219,0.3)',
    marginBottom: space.sm,
  },
  planSelected: { borderColor: '#efe9db', backgroundColor: 'rgba(239,233,219,0.08)' },
});
