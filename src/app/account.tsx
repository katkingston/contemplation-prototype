/** A1 — Account: name/handle, email. */
import { router } from 'expo-router';
import React from 'react';
import { AppText, Button, Gap, ListRow, Screen } from '@/components/ui';
import { useApp } from '@/services/provider';

export default function Account() {
  const { data } = useApp();
  return (
    <Screen testID="account-screen">
      <Gap size="xl" />
      <AppText variant="title">Account</AppText>
      <Gap size="md" />
      <ListRow label="Name / handle" sub={data.profile?.username ?? '—'} />
      <ListRow label="Email" sub={data.profile?.email ?? '—'} />
      <ListRow
        label="Member since"
        sub={data.profile ? new Date(data.profile.createdAt).toDateString() : '—'}
      />
      <Gap size="xl" />
      <Button label="Back" kind="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
