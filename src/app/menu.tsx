/**
 * Menu — the Journey tab's landing screen (Jul 30 designs): a dark surface
 * with the daily quote up top and three big lowercase destinations —
 * series / journey / learn — separated by hairlines.
 */
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { TabScreen } from '@/components/BottomNav';
import { AppText, Gap } from '@/components/ui';
import { dailyQuote } from '@/content/copy';
import { color, space, type } from '@/theme/tokens';

const DESTINATIONS: { label: string; route: string; testID: string }[] = [
  { label: 'series', route: '/library', testID: 'menu-series' },
  { label: 'journey', route: '/journey', testID: 'menu-journey' },
  { label: 'learn', route: '/learn', testID: 'menu-learn' },
];

export default function Menu() {
  const quote = dailyQuote();
  return (
    <TabScreen active="journey" dark>
      <Gap size="xl" />
      <AppText variant="monoBody" dark>
        {`“${quote.text}”`}
      </AppText>
      <Gap size="sm" />
      <AppText variant="heading" dark muted>
        {quote.by}
      </AppText>
      <Gap size="xl" />
      <View>
        {DESTINATIONS.map((d) => (
          <Pressable
            key={d.label}
            accessibilityRole="button"
            accessibilityLabel={d.label}
            onPress={() => router.push(d.route as never)}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
            testID={d.testID}>
            <AppText dark style={styles.rowLabel as never}>
              {d.label}
            </AppText>
          </Pressable>
        ))}
        <View style={styles.endRule} />
      </View>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: space.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(239,233,219,0.35)',
  },
  rowLabel: { ...type.titleLower, color: color.onDark },
  endRule: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(239,233,219,0.35)',
  },
});
