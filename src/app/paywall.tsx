/**
 * O5 — Paywall (Jul 30 designs): light screen — wordmark, mono value
 * statement, three hairline plan rows (selected row shaded, Annual carries a
 * boxed Save tag), then "Start with 3 days free" + note + full-width CTA.
 * MOCK purchases: selecting a plan + Start free trial writes a local access
 * grant. Real RevenueCat wiring replaces the grant call only (see AccessService
 * notes in services/supabase + App-CLAUDE.md payments rules).
 *
 * Layout (Kat, Aug 19): this screen is too dense to compress into a short
 * phone viewport, so it FLOWS — gaps derived from the O5 anchors, scaled to
 * the viewport, and the page scrolls when it must. At 844 it matches Figma.
 */
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenFade } from '@/components/Transitions';
import { AppText, Button, TextLink, useAnchor, Wordmark } from '@/components/ui';
import { paywall, plans, ProductType } from '@/content/copy';
import { orderedSeries } from '@/content/series';
import { useApp } from '@/services/provider';
import { anchor, color, space } from '@/theme/tokens';

/**
 * Measured off O5. Plan rows sit on a 76pt pitch from 373; inside a row the
 * title is at +0, its detail at +24, and the full-bleed rule closes it at +62.
 * The price is not right-aligned — it starts its own column at x=270.
 */
const PLAN_RULE = 62;
/** Air between a rule and the next row's text — folded INTO the cell above
 *  the text so the selection tint reaches the rule (Kat, Aug 18). */
const PLAN_LEAD = 13;
const PRICE_COLUMN = 270;

export default function Paywall() {
  const { act } = useApp();
  const insets = useSafeAreaInsets();
  const ax = useAnchor();
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
    <View style={styles.root} testID="paywall-screen">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: Math.max(insets.bottom, space.md) }}>
        <ScreenFade style={{ flex: 1 }}>
          <View style={{ height: Math.max(ax(anchor.wordmark) - insets.top, space.sm) }} />
          <View style={styles.gutter}>
            <Wordmark />
          </View>
          {/* O5: intro at 180 on a narrow measure — four short typewriter lines. */}
          <View style={{ height: ax(anchor.intro) - ax(anchor.wordmark) - 25 }} />
          <View style={styles.gutter}>
            <AppText variant="monoBody" style={{ maxWidth: 250 }}>
              {paywall.subhead}
            </AppText>
          </View>
          {/* Intro block ends ~268; first cell's lead-in opens at 360. */}
          <View style={{ height: ax(360) - ax(268) }} />
          {plans.map((p) => {
            const sel = selected === p.productType;
            return (
              <View key={p.productType}>
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
              </View>
            );
          })}
          {/* Flexible middle: soaks up whatever height the viewport offers, so
              the trial block + CTA sit low on tall screens and the page simply
              scrolls on short ones. */}
          <View style={{ flexGrow: 1, minHeight: ax(16) }} />
          <View style={styles.gutter}>
            <AppText variant="caption" muted>
              Prototype: purchases are simulated — no charge of any kind.
            </AppText>
            <View style={{ height: 34 }} />
            <AppText variant="heading">{paywall.trialTitle}</AppText>
            <View style={{ height: 12 }} />
            <AppText variant="caption" muted>
              {paywall.trialNote}
            </AppText>
            <View style={{ height: 20 }} />
            <Button label={paywall.cta} arrow onPress={purchase} testID="start-trial" />
            <View style={{ height: 14 }} />
            <TextLink
              label="Back"
              center
              muted
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
              testID="paywall-back"
            />
          </View>
        </ScreenFade>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.paper },
  gutter: { paddingHorizontal: space.lg },
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
