/**
 * Persistent crisis-resources affordance.
 * Hard rule (App-CLAUDE.md): reachable from a persistent button on every
 * contemplation screen — small and dim there, but always present.
 */
import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { mentalHealthResources, resourcesFootnote } from '@/content/copy';
import { color, radius, space, type } from '@/theme/tokens';
import { AppText, Sheet, TextLink } from './ui';

/**
 * X2: mono intro on a narrow measure at 180, then resource rows on a ~74pt
 * pitch ruled above, and the footnote at 652. Call/Text are underlined text
 * links set right — the same affordance Kat approved on X1 Crisis Support, not
 * a filled chip.
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
      {mentalHealthResources.map((r) => (
        <View
          key={r.label}
          style={[styles.resourceRow, dark && { borderTopColor: 'rgba(251,251,246,0.3)' }]}>
          <Pressable
            accessibilityRole={r.url ? 'link' : undefined}
            onPress={r.url ? () => Linking.openURL(r.url!) : undefined}
            style={{ flex: 1 }}>
            <AppText variant="bodyBold" dark={dark}>
              {r.label}
            </AppText>
            <AppText variant="small" muted dark={dark} style={{ marginTop: 3 }}>
              {r.detail}
            </AppText>
          </Pressable>
          {r.tel ? (
            <TextLink
              label={r.tel.startsWith('sms') ? 'Text' : 'Call'}
              dark={dark}
              onPress={() => Linking.openURL(r.tel!)}
            />
          ) : null}
        </View>
      ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  endRule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.line },
});
