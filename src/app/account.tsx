/** A1 — Account: name/handle, email. */
import React from 'react';
import { TabScreen } from '@/components/BottomNav';
import { AppText, Gap, ListRow } from '@/components/ui';
import { useApp } from '@/services/provider';

export default function Account() {
  const { data } = useApp();
  return (
    <TabScreen active="account">
      <Gap size="xl" />
      <AppText variant="title">Account</AppText>
      <Gap size="md" />
      <ListRow label="Name / handle" sub={data.profile?.username ?? '—'} />
      <ListRow label="Email" sub={data.profile?.email ?? '—'} />
      <ListRow
        label="Member since"
        sub={data.profile ? new Date(data.profile.createdAt).toDateString() : '—'}
      />
    </TabScreen>
  );
}
