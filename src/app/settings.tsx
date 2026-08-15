/**
 * A2 — Settings: notifications, music default, export data, DELETE ACCOUNT
 * (true wipe — Apple 5.1.1(v)), crisis resources, dev fast-forward for testing.
 */
import { router } from 'expo-router';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, Platform, Share, View } from 'react-native';
import { DropTimeInput } from '@/components/DropTimeInput';
import { AppText, Button, Gap, ListRow, Screen, Sheet, Spacer, TextLink } from '@/components/ui';
import { activeSeries, formatTime, progressFor } from '@/services/logic';
import { useApp } from '@/services/provider';
import { anchor, timing } from '@/theme/tokens';


/**
 * Testing tools appear in dev builds, or when the build was exported with
 * EXPO_PUBLIC_DEV_TOOLS=1 (the shared web prototype). TestFlight/App Store
 * builds set neither, so the tools disappear there automatically.
 */
const SHOW_DEV_TOOLS = __DEV__ || process.env.EXPO_PUBLIC_DEV_TOOLS === '1';

export default function Settings() {
  const { data, act, services } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editTime, setEditTime] = useState(false);
  const [editTimer, setEditTimer] = useState(false);

  const exportData = async () => {
    const json = await services.exportData();
    try {
      if (Platform.OS === 'web') {
        // Full-fidelity download — never truncate a data export.
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contemplation-export.json';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        return;
      }
      const file = new File(Paths.cache, 'contemplation-export.json');
      file.write(json);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/json' });
      } else {
        await Share.share({ message: json });
      }
    } catch {
      Alert.alert('Export failed', 'Could not export your data on this device.');
    }
  };

  const doDelete = async () => {
    const ok = await act((s) => s.deleteAccount());
    setConfirmDelete(false);
    if (!ok) return; // deletion failed — banner explains; don't pretend it worked
    router.dismissAll?.();
    router.replace('/');
  };

  // Dev helper for testing: completes the current contemplation instantly.
  const fastForward = async () => {
    const s = activeSeries(data);
    const p = progressFor(data, s.id);
    if (p.currentIndex >= s.contemplations.length) return;
    const c = s.contemplations[p.currentIndex];
    await act((x) => x.recordContemplationComplete(s.id, c.id, 60, { backdate: true }));
  };

  const timerMin = timing.timerChoicesMin.includes(data.settings.timerDefaultMin)
    ? data.settings.timerDefaultMin
    : timing.defaultTimerMin;

  // A2 "Settings Word Toggles": title 66, then single-line rows from 192 on a
  // 48pt pitch. State is a word on the right — "On"/"Off", the time, the
  // timer — not a platform switch, and only navigating rows take an arrow.
  return (
    <Screen testID="settings-screen" top={anchor.pageTitle}>
      <AppText variant="titleLower">Settings</AppText>
      <View style={{ height: anchor.rowsTop - anchor.pageTitle - 31 - 13.25 }} />
      <ListRow
        label="Push notifications"
        rightLabel={data.settings.notificationsEnabled ? 'On' : 'Off'}
        arrow={false}
        onPress={() =>
          void act((s) =>
            s.saveSettings({ notificationsEnabled: !data.settings.notificationsEnabled }),
          )
        }
        testID="toggle-notifications"
      />
      <ListRow
        label="Background music"
        rightLabel={data.settings.musicDefaultOn ? 'On' : 'Off'}
        arrow={false}
        onPress={() =>
          void act((s) => s.saveSettings({ musicDefaultOn: !data.settings.musicDefaultOn }))
        }
        testID="toggle-music"
      />
      <ListRow
        label="Daily contemplation time"
        rightLabel={formatTime(data.settings.dropHour, data.settings.dropMinute)}
        arrow={false}
        onPress={() => setEditTime(true)}
        testID="edit-drop-time"
      />
      <ListRow
        label="Default timer"
        rightLabel={`${timerMin} min`}
        arrow={false}
        onPress={() => setEditTimer(true)}
        testID="settings-default-timer"
      />
      <ListRow label="Export my data" onPress={exportData} testID="export-data" />
      {/* Send feedback moved to Account (Jul 30 designs). */}
      <ListRow
        label="Delete account"
        rightLabel="Permanent"
        danger
        onPress={() => setConfirmDelete(true)}
        testID="delete-account"
      />
      {SHOW_DEV_TOOLS && (
        <>
          <Gap size="xl" />
          <AppText variant="caption" muted>
            Testing tools (hidden in release builds)
          </AppText>
          <ListRow
            label="Fast-forward one contemplation"
            onPress={fastForward}
            testID="fast-forward"
          />
          <ListRow label="Design system" onPress={() => router.push('/styleguide')} testID="open-styleguide" />
        </>
      )}
      {/* A2 sets Back on the frame's last line (749). This screen can outgrow
          the frame once the testing tools are on, so it rides the end of the
          flow and the spacer holds it down when the list is short. */}
      <Spacer />
      <Gap size="xl" />
      <TextLink label="Back" center muted onPress={() => router.back()} />
      <Gap size="xl" />
      <Sheet visible={editTime} onClose={() => setEditTime(false)} title="Daily contemplation time">
        <DropTimeInput onSaved={() => setEditTime(false)} />
      </Sheet>
      <Sheet visible={editTimer} onClose={() => setEditTimer(false)} title="Default timer">
        {timing.timerChoicesMin.map((m) => (
          <ListRow
            key={m}
            label={`${m} minute${m === 1 ? '' : 's'}`}
            rightLabel={m === timerMin ? 'Selected' : undefined}
            arrow={false}
            onPress={() => {
              void act((s) => s.saveSettings({ timerDefaultMin: m }));
              setEditTimer(false);
            }}
          />
        ))}
      </Sheet>
      <Sheet visible={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete account?">
        <AppText variant="body">
          This permanently deletes your account and all data: progress, reflections, and voice
          memos. This cannot be undone.
        </AppText>
        <Gap size="lg" />
        <Button label="Delete everything" kind="danger" onPress={doDelete} testID="confirm-delete" />
        <Gap size="xs" />
        <AppText variant="caption" muted center>
          True deletion, not deactivation. Required by Apple guideline 5.1.1(v).
        </AppText>
      </Sheet>
    </Screen>
  );
}
