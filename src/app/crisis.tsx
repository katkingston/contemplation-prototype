/**
 * Crisis — full-screen support page. Reached from the contemplation player's
 * crisis button: the contemplation ends IMMEDIATELY (no completion recorded,
 * media stops on unmount) and this screen takes over.
 * Layout follows A2 Settings Word Toggles: title, short intro, then hairline
 * rows whose right-hand "word toggle" IS the action (Call / Text), and a
 * centred outlined Back-style button. No red — the words carry the urgency.
 */
import { router } from 'expo-router';
import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { AppText, Button, Gap, Screen, Spacer, TextLink } from '@/components/ui';
import { mentalHealthResources } from '@/content/copy';
import { anchor, color, space } from '@/theme/tokens';

export default function Crisis() {
  const top3 = mentalHealthResources.slice(0, 3);
  return (
    <Screen fade={false} scroll={false} padded={false} testID="crisis-screen">
      <View style={styles.body}>
        <View style={{ height: anchor.monoHeader - 11 }} />
        <AppText variant="titleLower">Support is here</AppText>
        <Gap size="md" />
        <AppText variant="body" muted>
          The contemplation has ended. Whatever came up, you do not have to hold it
          alone. These people are ready to listen, right now.
        </AppText>
        <Gap size="xl" />
        {top3.map((r) => {
          const isText = r.tel?.startsWith('sms') ?? false;
          return (
            <Pressable
              key={r.label}
              accessibilityRole="button"
              accessibilityLabel={`${isText ? 'Text' : 'Call'} ${r.label}`}
              onPress={r.tel ? () => Linking.openURL(r.tel!) : undefined}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
              testID={`crisis-${isText ? 'text' : 'call'}`}>
              <View style={{ flex: 1 }}>
                <AppText variant="bodyBold">{r.label}</AppText>
                <AppText variant="small" muted>
                  {r.detail}
                </AppText>
              </View>
              {/* A2's word toggle: the action word, right-aligned + underlined. */}
              <AppText variant="bodyBold" style={styles.action}>
                {isText ? 'Text' : 'Call'}
              </AppText>
            </Pressable>
          );
        })}
        <View style={styles.endRule} />
        <Gap size="lg" />
        <TextLink
          label="More mental health resources"
          muted
          onPress={() => router.push('/resources')}
          testID="crisis-more-resources"
        />
        <Spacer />
        <Button
          label="Return home"
          kind="secondary"
          onPress={() => router.replace('/home')}
          testID="crisis-home"
        />
        <Gap size="lg" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: space.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.muted,
    minHeight: 48,
  },
  action: { textDecorationLine: 'underline' },
  endRule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.muted },
});
