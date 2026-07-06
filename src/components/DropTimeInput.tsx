/**
 * DropTimeInput — type the daily drop time ("6:30 pm", "18:00", "7").
 * Bare hours 1-7 read as evening. Saves through the service layer.
 */
import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { notify } from '@/components/Notice';
import { AppText, Button, Gap } from '@/components/ui';
import { formatTime, parseTimeInput } from '@/services/logic';
import { useApp } from '@/services/provider';
import { color, radius, space, type } from '@/theme/tokens';

export function DropTimeInput({ onSaved }: { onSaved?: () => void }) {
  const { data, act } = useApp();
  const [text, setText] = useState(formatTime(data.settings.dropHour, data.settings.dropMinute));

  const save = async () => {
    const parsed = parseTimeInput(text);
    if (!parsed) {
      notify('That time didn’t parse. Try something like "6:30 pm" or "18:00".', 'error');
      return;
    }
    const ok = await act((s) => s.saveSettings({ dropHour: parsed.hour, dropMinute: parsed.minute }));
    if (ok) {
      setText(formatTime(parsed.hour, parsed.minute));
      notify(`New contemplations arrive at ${formatTime(parsed.hour, parsed.minute)}`, 'success');
      onSaved?.();
    }
  };

  return (
    <View>
      <View style={styles.row}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={save}
          accessibilityLabel="Daily contemplation time"
          placeholder="6:00 PM"
          placeholderTextColor={color.muted}
          style={styles.input}
          testID="drop-time-input"
        />
        <Button label="Set" small kind="secondary" onPress={save} testID="drop-time-save" />
      </View>
      <Gap size="xs" />
      <AppText variant="caption" muted>
        Each day’s contemplation arrives at this time.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  input: {
    ...type.body,
    flex: 1,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: space.md,
    backgroundColor: color.faint,
    color: color.ink,
    minHeight: 44,
  },
});
