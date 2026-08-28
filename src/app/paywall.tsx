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
import {
  Anchored,
  AnchoredBottom,
  AppText,
  Button,
  Stage,
  TextLink,
  Wordmark,
} from '@/components/ui';
import { paywall, plans, ProductType } from '@/content/copy';
import { orderedSeries } from '@/content/series';
import { useApp } from '@/services/provider';
import { anchor, anchorBottom, color, space } from '@/theme/tokens';

/**
 * Measured off O5. Plan rows sit on a 76pt pitch from 373; inside a row the
 * title is at +0, its detail at +24, and the full-bleed rule closes it at +62.
 * The price is not right-aligned — it starts its own column at x=270.
 */
const PLAN_TOP = 373;
const PLAN_PITCH = 76;
const PLAN_RULE = 62;
/** Air between a rule and the next row's text — folded INTO the cell above
 *  the text so the selection tint reaches the rule (Kat, Aug 18). */
const PLAN_LEAD = PLAN_PITCH - PLAN_RULE - 1;
const PRICE_COLUMN = 270;

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
    <Stage testID="paywall-screen">
      <Anchored y={anchor.wordmark}>
        <Wordmark />
      </Anchored>
      <Anchored y={anchor.intro}>
        {/* O5 sets this on a narrow measure so it breaks into four short
            typewriter lines — full width would flatten it to three. */}
        <AppText variant="monoBody" style={{ maxWidth: 250 }}>
          {paywall.subhead}
        </AppText>
      </Anchored>
      {plans.map((p, i) => {
        const sel = selected === p.productType;
        // The cell runs RULE TO RULE (Kat, Aug 18): the tinted, tappable block
        // starts just under the previous row's rule and ends at its own, so
        // the selection wash covers the entire clickable area with no gap.
        return (
          <Anchored
            key={p.productType}
            y={PLAN_TOP + i * PLAN_PITCH - PLAN_LEAD}
            gutter={false}>
            <Pressable
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
                <AppText variant="small" muted style={{ marginTop: 3 }}>
                  {p.detail}
                </AppText>
              </View>
              <AppText variant="small" style={styles.price}>
                {p.price}
              </AppText>
            </Pressable>
            <View style={styles.rule} />
          </Anchored>
        );
      })}
      <Anchored y={604}>
        <AppText variant="caption" muted>
          Prototype: purchases are simulated — no charge of any kind.
        </AppText>
      </Anchored>
      <Anchored y={653}>
        <AppText variant="heading">{paywall.trialTitle}</AppText>
      </Anchored>
      <Anchored y={689}>
        <AppText variant="caption" muted>
          {paywall.trialNote}
        </AppText>
      </Anchored>
      <AnchoredBottom up={anchorBottom.action}>
        <Button label={paywall.cta} arrow onPress={purchase} testID="start-trial" />
      </AnchoredBottom>
      <AnchoredBottom up={20}>
        <TextLink
          label="Back"
          center
          muted
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
          testID="paywall-back"
        />
      </AnchoredBottom>
    </Stage>
  );
}

const styles = StyleSheet.create({
  plan: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: space.lg,
    // Full cell: lead-in air + the 62 content block, ending at the rule.
    height: PLAN_LEAD + PLAN_RULE,
    paddingTop: PLAN_LEAD,
  },
  /** Selection tint bleeds the full width, like the rules — no inset card. */
  planSelected: { backgroundColor: color.faint },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  price: { width: 390 - PRICE_COLUMN - space.lg },
  badge: {
    borderWidth: 1,
    borderColor: color.muted,
    paddingHorizontal: 8,
    height: 20,
    justifyContent: 'center',
  },
  rule: { height: 1, backgroundColor: color.muted, opacity: 0.5 },
});
