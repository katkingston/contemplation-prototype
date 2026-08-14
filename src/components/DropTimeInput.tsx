/**
 * DropTimeInput — type the daily drop time ("6:30 pm", "18:00", "7").
 * Bare hours 1-7 read as evening. Saves through the service layer.
 */
import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { notify } from '@/components/Notice';
import { Button } from '@/components/ui';
import { formatTime, parseTimeInput } from '@/services/logic';
import { useApp } from '@/services/provider';
import { color, space, type } from '@/theme/tokens';

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

  // O9 Drop time (new) / DS canon: borderless underline input + small
  // outlined Set button, no helper caption.
  return (
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
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md },
  input: {
    ...type.body,
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: color.line,
    paddingVertical: space.sm,
    color: color.ink,
    minHeight: 44,
  },
});
