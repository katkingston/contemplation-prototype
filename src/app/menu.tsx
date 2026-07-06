/**
 * M1 — Menu. Full-screen solid dark surface (Open reference): a big-caps
 * editorial index up top, quieter utility rows below.
 */
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { TabScreen } from '@/components/BottomNav';
import { ResourcesList } from '@/components/CrisisButton';
import { AppText, Gap, Sheet } from '@/components/ui';
import { color, space } from '@/theme/tokens';

const INDEX: { label: string; route: string; testID: string }[] = [
  { label: 'Journal', route: '/reflections', testID: 'menu-journal' },
  { label: 'Series', route: '/library', testID: 'menu-series' },
  { label: 'Stats', route: '/practice-stats', testID: 'menu-stats' },
];

export default function Menu() {
  const [showResources, setShowResources] = useState(false);

  return (
    <TabScreen active="menu" dark>
      <Gap size="xxl" />
      {INDEX.map((item) => (
        <Pressable
          key={item.route}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          onPress={() => router.push(item.route as never)}
          style={({ pressed }) => [styles.indexItem, pressed && { opacity: 0.6 }]}
          testID={item.testID}>
          <AppText variant="title" dark>
            {item.label}
          </AppText>
        </Pressable>
      ))}
      <Gap size="xxl" />
      <View style={styles.rule} />
      {[
        { label: 'Settings', onPress: () => router.push('/settings'), testID: 'menu-settings' },
        {
          label: 'Subscription',
          onPress: () => router.push('/subscription'),
          testID: 'menu-subscription',
        },
        {
          label: 'Mental Health Resources',
          onPress: () => setShowResources(true),
          testID: 'menu-resources',
        },
      ].map((row) => (
        <Pressable
          key={row.label}
          accessibilityRole="button"
          accessibilityLabel={row.label}
          onPress={row.onPress}
          style={({ pressed }) => [styles.utilityRow, pressed && { opacity: 0.6 }]}
          testID={row.testID}>
          <AppText variant="bodyBold" dark>
            {row.label}
          </AppText>
          <AppText variant="body" dark muted>
            {'›'}
          </AppText>
        </Pressable>
      ))}
      <Sheet
        visible={showResources}
        onClose={() => setShowResources(false)}
        title="Mental Health Resources">
        <ResourcesList />
      </Sheet>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  indexItem: { paddingVertical: space.md, minHeight: 44 },
  rule: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(239,233,219,0.3)',
    marginBottom: space.md,
  },
  utilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(239,233,219,0.15)',
  },
});
