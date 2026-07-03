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
        <Pressable
          key={r.label}
          accessibilityRole={r.url ? 'link' : undefined}
          onPress={r.url ? () => Linking.openURL(r.url!) : undefined}
          style={styles.resourceRow}>
          <AppText variant="bodyBold">{r.label}</AppText>
          <AppText variant="small" muted>
            {r.detail}
          </AppText>
        </Pressable>
      ))}
      <AppText variant="caption" muted style={{ marginTop: space.md }}>
        {resourcesFootnote}
      </AppText>
    </View>
  );
}

export function CrisisButton({ dim = false }: { dim?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Crisis resources"
        onPress={() => setOpen(true)}
        style={[styles.pill, dim && { opacity: 0.5, borderColor: 'rgba(239,233,219,0.45)' }]}>
        <Text style={[type.label, { color: dim ? '#efe9db' : color.danger }]}>✚ Crisis</Text>
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
  },
});
