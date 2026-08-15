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
    // J1: quote 70, attribution 126 in mono caps, then the three destinations
    // on a 110pt pitch from 265.
    <TabScreen active="journey" dark>
      <View style={{ height: 70 }} />
      {/* Fixed 156-tall well so the destinations always start on 226, whatever
          length the day's quote happens to be. */}
      <View style={{ height: 156 }}>
        <AppText variant="monoBody" dark>
          {`“${quote.text}”`}
        </AppText>
        <View style={{ height: 34 }} />
        <AppText variant="label" dark muted>
          {quote.by}
        </AppText>
      </View>
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
    // 110pt pitch: a 26/31.2 label with 39.4 either side, ruled above.
    paddingVertical: 39.4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(251,251,246,0.35)',
  },
  rowLabel: { ...type.titleLower, color: color.onDark },
  endRule: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(251,251,246,0.35)',
  },
});
