/**
 * SeriesDashes — the small per-series progress indicator from the Open
 * reference: one short dash per contemplation. Filled = done, accent = today,
 * faint = still locked. Reveals rhythm without revealing content.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { color } from '@/theme/tokens';

export function SeriesDashes({
  total,
  done,
  active = false,
  dark = false,
}: {
  total: number;
  done: number;
  /** Highlight the next dash as "today". */
  active?: boolean;
  dark?: boolean;
}) {
  return (
    <View style={styles.row} accessibilityLabel={`${done} of ${total} complete`}>
      {Array.from({ length: total }, (_, i) => {
        const isDone = i < done;
        const isToday = active && i === done;
        return (
          <View
            key={i}
            style={[
              styles.dash,
              {
                backgroundColor: isDone
                  ? dark
                    ? color.accentBright
                    : color.accent
                  : isToday
                    ? dark
                      ? color.onDark
                      : color.ink
                    : dark
                      ? 'rgba(239,233,219,0.25)'
                      : color.line,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  dash: { width: 14, height: 3, borderRadius: 2 },
});
