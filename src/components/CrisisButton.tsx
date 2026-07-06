/**
 * Persistent crisis-resources affordance.
 * Hard rule (App-CLAUDE.md): reachable from a persistent button on every
 * contemplation screen — small and dim there, but always present.
 */
import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { mentalHealthResources, resourcesFootnote } from '@/content/copy';
import { color, radius, space, type } from '@/theme/tokens';
import { AppText, Sheet } from './ui';

export function ResourcesList() {
  return (
    <View>
      <AppText variant="body" style={{ marginBottom: space.md }}>
        If this content brings up difficult feelings, support is available.
      </AppText>
      {mentalHealthResources.map((r) => (
        <View key={r.label} style={styles.resourceRow}>
          <Pressable
            accessibilityRole={r.url ? 'link' : undefined}
            onPress={r.url ? () => Linking.openURL(r.url!) : undefined}
            style={{ flex: 1 }}>
            <AppText variant="bodyBold">{r.label}</AppText>
            <AppText variant="small" muted>
              {r.detail}
            </AppText>
          </Pressable>
          {r.tel ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${r.tel.startsWith('sms') ? 'Text' : 'Call'} ${r.label}`}
              onPress={() => Linking.openURL(r.tel!)}
              style={styles.telChip}>
              <AppText variant="caption" style={{ color: color.paper }}>
                {r.tel.startsWith('sms') ? 'TEXT' : 'CALL'}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ))}
      <AppText variant="caption" muted style={{ marginTop: space.md }}>
        {resourcesFootnote}
      </AppText>
    </View>
  );
}

export function CrisisButton({
  dim = false,
  onPress,
}: {
  dim?: boolean;
  /** Override the default sheet (the player ends the contemplation and
      routes to the full-screen /crisis page). */
  onPress?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Crisis resources"
        hitSlop={12}
        onPress={onPress ?? (() => setOpen(true))}
        style={[styles.pill, dim && { opacity: 0.5, borderColor: 'rgba(239,233,219,0.45)' }]}>
        <Text style={[type.caption, { textTransform: 'uppercase', letterSpacing: 0.8, color: dim ? '#efe9db' : color.danger }]}>✚ Crisis</Text>
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)} title="Mental Health Resources">
        <ResourcesList />
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#e6b3b0',
    alignSelf: 'flex-end',
  },
  resourceRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  telChip: {
    backgroundColor: color.danger,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});
