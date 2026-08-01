/**
 * SeriesDashes — the small per-series progress indicator. Jul 30 designs:
 * round dots, filled = done, solid "today" marker, outlined ring = still to
 * come. Reveals rhythm without revealing content. (Name kept from the dash
 * era so call sites stay stable.)
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
  /** Highlight the next dot as "today". */
  active?: boolean;
  dark?: boolean;
}) {
  return (
    <View style={styles.row} accessibilityLabel={`${done} of ${total} complete`}>
      {Array.from({ length: total }, (_, i) => {
        const isDone = i < done;
        const isToday = active && i === done;
        const fill = isDone
          ? dark
            ? color.onDark
            : color.accent
          : isToday
            ? dark
              ? color.accentBright
              : color.ink
            : 'transparent';
        return (
          <View
            key={i}
            style={[
              styles.dot,
              fill === 'transparent'
                ? {
                    borderWidth: 1,
                    borderColor: dark ? 'rgba(251,251,246,0.4)' : color.accentBright,
                  }
                : { backgroundColor: fill },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
