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

/**
 * X2: mono intro on a narrow measure at 180, then resource rows on a ~74pt
 * pitch ruled above, and the footnote at 652. No Call/Text affordances on the
 * right (Kat, Aug 18) — the whole row is the action: tel rows dial, url rows
 * open the site.
 */
export function ResourcesList({ dark = false }: { dark?: boolean }) {
  return (
    <View>
      <AppText
        variant={dark ? 'monoBody' : 'body'}
        dark={dark}
        style={{ maxWidth: dark ? 240 : undefined, marginBottom: 130 }}>
        If this content brings up difficult feelings, support is available.
      </AppText>
      {mentalHealthResources.map((r) => {
        const target = r.tel ?? r.url;
        return (
          <Pressable
            key={r.label}
            accessibilityRole={target ? 'link' : undefined}
            accessibilityLabel={
              r.tel ? `${r.tel.startsWith('sms') ? 'Text' : 'Call'} ${r.label}` : r.label
            }
            onPress={target ? () => Linking.openURL(target) : undefined}
            style={({ pressed }) => [
              styles.resourceRow,
              dark && { borderTopColor: 'rgba(251,251,246,0.3)' },
              pressed && { opacity: 0.6 },
            ]}>
            <AppText variant="bodyBold" dark={dark}>
              {r.label}
            </AppText>
            <AppText variant="small" muted dark={dark} style={{ marginTop: 3 }}>
              {r.detail}
            </AppText>
          </Pressable>
        );
      })}
      <View style={[styles.endRule, dark && { borderTopColor: 'rgba(251,251,246,0.3)' }]} />
      <AppText variant="caption" muted dark={dark} style={{ marginTop: space.md }}>
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
        style={[styles.pill, dim && { opacity: 0.5, borderColor: 'rgba(251,251,246,0.45)' }]}>
        <Text style={[type.caption, { textTransform: 'uppercase', letterSpacing: 0.8, color: dim ? color.onDark : color.ink }]}>✚ Crisis</Text>
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
    // ~74pt pitch: a 15/21 label over a 13/19 detail, 15 either side, ruled above.
    paddingVertical: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.line,
  },
  endRule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.line },
});
