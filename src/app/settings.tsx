/**
 * A2 — Settings: notifications, music default, export data, DELETE ACCOUNT
 * (true wipe — Apple 5.1.1(v)), crisis resources, dev fast-forward for testing.
 */
import { router } from 'expo-router';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, Platform, Share, Switch } from 'react-native';
import { ResourcesList } from '@/components/CrisisButton';
import { AppText, Button, Gap, ListRow, Screen, Sheet } from '@/components/ui';
import { activeSeries, progressFor } from '@/services/logic';
import { useApp } from '@/services/provider';


/**
 * Testing tools appear in dev builds, or when the build was exported with
 * EXPO_PUBLIC_DEV_TOOLS=1 (the shared web prototype). TestFlight/App Store
 * builds set neither, so the tools disappear there automatically.
 */
const SHOW_DEV_TOOLS = __DEV__ || process.env.EXPO_PUBLIC_DEV_TOOLS === '1';

export default function Settings() {
  const { data, act, services } = useApp();
  const [showResources, setShowResources] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  return (
    <Screen testID="settings-screen">
      <Gap size="xl" />
      <AppText variant="title">Settings</AppText>
      <Gap size="md" />
      <ListRow
        label="Push notifications"
        sub="streak reminders (prototype: preference only)"
        right={
          <Switch
            value={data.settings.notificationsEnabled}
            onValueChange={(v) => void act((s) => s.saveSettings({ notificationsEnabled: v }))}
          />
        }
      />
      <ListRow
        label="Background music"
        sub="default for new contemplations"
        right={
          <Switch
            value={data.settings.musicDefaultOn}
            onValueChange={(v) => void act((s) => s.saveSettings({ musicDefaultOn: v }))}
          />
        }
      />
      <ListRow
        label="Mental Health Resources"
        sub="crisis and support links"
        onPress={() => setShowResources(true)}
      />
      <ListRow
        label="Export my data"
        sub="includes thoughts & voice memo references"
        onPress={exportData}
        testID="export-data"
      />
      <ListRow
        label="Delete account"
        sub="permanently removes thoughts & voice memos"
        danger
        onPress={() => setConfirmDelete(true)}
        testID="delete-account"
      />
      {SHOW_DEV_TOOLS && (
        <>
          <Gap size="lg" />
          <AppText variant="caption" muted>
            Testing tools (hidden in release builds)
          </AppText>
          <ListRow
            label="Fast-forward one contemplation"
            sub="dev shortcut: marks today’s contemplation complete"
            onPress={fastForward}
            testID="fast-forward"
          />
          <ListRow
            label="Design system"
            sub="living style guide · tokens & components"
            onPress={() => router.push('/styleguide')}
            testID="open-styleguide"
          />
        </>
      )}
      <Gap size="xl" />
      <Button label="Back" kind="ghost" onPress={() => router.back()} />
      <Sheet
        visible={showResources}
        onClose={() => setShowResources(false)}
        title="Mental Health Resources">
        <ResourcesList />
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
