/**
 * Crisis — full-screen support page. Reached from the contemplation player's
 * crisis button: the contemplation ends IMMEDIATELY (no completion recorded,
 * media stops on unmount) and this screen takes over. First three resources
 * with direct call/text actions, then a link to the full resources page.
 */
import { router } from 'expo-router';
import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { AppText, Button, Gap, Screen } from '@/components/ui';
import { mentalHealthResources } from '@/content/copy';
import { color, radius, space } from '@/theme/tokens';

export default function Crisis() {
  const top3 = mentalHealthResources.slice(0, 3);
  return (
    <Screen fade={false} testID="crisis-screen">
      <Gap size="xxl" />
      <AppText variant="title">Support is here</AppText>
      <Gap size="sm" />
      <AppText variant="body" muted>
        The contemplation has ended. Whatever came up, you do not have to hold it
        alone. These people are ready to listen, right now.
      </AppText>
      <Gap size="xl" />
      {top3.map((r) => (
        <View key={r.label} style={styles.card}>
          <AppText variant="bodyBold">{r.label}</AppText>
          <Gap size="xs" />
          <AppText variant="small" muted>
            {r.detail}
          </AppText>
          {r.tel ? (
            <>
              <Gap size="md" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${r.tel.startsWith('sms') ? 'Text' : 'Call'} ${r.label}`}
                onPress={() => Linking.openURL(r.tel!)}
                style={styles.action}>
                <AppText variant="bodyBold" style={{ color: color.paper }}>
                  {r.tel.startsWith('sms') ? 'Text now' : 'Call now'}
                </AppText>
              </Pressable>
            </>
          ) : null}
        </View>
      ))}
      <Gap size="md" />
      <Button
        label="More mental health resources"
        kind="ghost"
        onPress={() => router.push('/resources')}
        testID="crisis-more-resources"
      />
      <Gap size="xl" />
      <Button label="Return home" kind="secondary" onPress={() => router.replace('/home')} testID="crisis-home" />
      <Gap size="lg" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.md,
    padding: space.lg,
    marginBottom: space.md,
    backgroundColor: color.faint,
  },
  action: {
    backgroundColor: color.muted, // DS canon: no red — Mud fill + words carry urgency
    borderRadius: radius.sm,
    paddingVertical: 14,
    paddingHorizontal: 26,
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
});
