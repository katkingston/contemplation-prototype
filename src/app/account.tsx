/**
 * A1 — Account (Open profile reference): identity header, practice stats
 * strip, accomplishments wall (soft-glow milestone badges), guest pass card,
 * and a "member since" wordmark footer.
 */
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { TabScreen } from '@/components/BottomNav';
import { lifetimeStats, MILESTONES } from '@/services/logic';
import { shareMessage } from '@/services/share';
import { AppText, Button, Eyebrow, Gap, ListRow, Row } from '@/components/ui';
import { useApp } from '@/services/provider';
import { APP_NAME, color, font, radius, space } from '@/theme/tokens';

const SHARE_URL = 'https://katkingston.github.io/contemplation-prototype/';

function Badge({ n, unit, achieved }: { n: number; unit: string; achieved: boolean }) {
  return (
    <View style={styles.badgeWrap}>
      <View style={[styles.badge, achieved && styles.badgeGlow]}>
        <LinearGradient
          colors={achieved ? ['#99b955', '#4c5232'] : ['#c8c2b2', '#8a8474']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
        />
        <AppText style={[styles.badgeNum, !achieved && { opacity: 0.55 }]}>{n}</AppText>
      </View>
      <Gap size="xs" />
      <AppText variant="caption" muted center>
        {n} {unit}
      </AppText>
    </View>
  );
}

export default function Account() {
  const { data, services, act } = useApp();
  const stats = lifetimeStats(data);
  const username = data.profile?.username || 'you';
  const firstName = username.charAt(0).toUpperCase() + username.slice(1);

  const signOut = async () => {
    if (!(await act(async (s) => s.signOut && (await s.signOut()))))
      return; // sign-out failed — stay put, notice explains
    router.dismissAll?.();
    router.replace('/');
  };

  const shareGuestPass = () =>
    shareMessage(
      `${firstName} sent you a week on ${APP_NAME}, a daily contemplation practice. ${SHARE_URL}`,
    );

  // Current plan, from the newest active grant (mock until RevenueCat).
  const now = Date.now();
  const activeGrant = [...data.grants]
    .filter((g) => (g.expiresAt == null || new Date(g.expiresAt).getTime() > now))
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))[0];
  const planName = activeGrant
    ? { series_pack: 'Series Pack', monthly: 'Monthly', annual: 'Annual' }[activeGrant.productType]
    : 'No active plan';

  const statCells = [
    { n: stats.currentStreak, label: 'Current streak' },
    { n: stats.bestStreak, label: 'Best streak' },
    { n: stats.contemplations, label: 'Contemplations' },
    { n: stats.minutes, label: 'Minutes' },
  ];

  return (
    <TabScreen active="account">
      <Gap size="xl" />
      {/* Identity header */}
      <Row between>
        <View style={{ flex: 1 }}>
          <AppText variant="title">{firstName}</AppText>
          <AppText variant="small" muted>
            @{username} · {data.profile?.email ?? ''}
          </AppText>
        </View>
        <View style={styles.avatar}>
          <LinearGradient
            colors={['#7f8f3d', '#2c2e17']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <AppText variant="heading" style={{ color: color.onDark }}>
            {(username[0] ?? '•').toUpperCase()}
          </AppText>
        </View>
      </Row>

      {/* Subscription */}
      <Eyebrow>Subscription</Eyebrow>
      <ListRow
        label={planName}
        sub={
          activeGrant?.expiresAt
            ? `access until ${new Date(activeGrant.expiresAt).toLocaleDateString()}`
            : activeGrant
              ? 'active'
              : 'choose a plan to continue your practice'
        }
        onPress={() => router.push('/subscription')}
        testID="account-subscription"
      />

      {/* Practice stats */}
      <Eyebrow>Practice stats</Eyebrow>
      <View style={styles.statsRow}>
        {statCells.map((c) => (
          <View key={c.label} style={styles.statCell}>
            <AppText style={styles.statNum}>{c.n}</AppText>
            <AppText variant="caption" muted>
              {c.label}
            </AppText>
          </View>
        ))}
      </View>

      {/* Accomplishments */}
      <Eyebrow>Accomplishments</Eyebrow>
      <AppText variant="label" muted>
        Contemplations
      </AppText>
      <Gap size="sm" />
      <Row style={{ gap: space.md }}>
        {MILESTONES.contemplations.map((m) => (
          <Badge key={m} n={m} unit={m === 1 ? 'sit' : 'sits'} achieved={stats.contemplations >= m} />
        ))}
      </Row>
      <Gap size="lg" />
      <AppText variant="label" muted>
        Streaks
      </AppText>
      <Gap size="sm" />
      <Row style={{ gap: space.md }}>
        {MILESTONES.streaks.map((m) => (
          <Badge key={m} n={m} unit="days" achieved={stats.bestStreak >= m} />
        ))}
      </Row>

      {/* Guest pass */}
      <Eyebrow>{`Share ${APP_NAME}`}</Eyebrow>
      <View style={styles.passCard}>
        <AppText variant="heading" style={{ color: color.onDark }}>
          {firstName}’s guest pass
        </AppText>
        <Gap size="xs" />
        <AppText variant="label" style={{ color: color.onDarkMuted }}>
          One week of access
        </AppText>
        <Gap size="lg" />
        <Row between>
          <AppText variant="caption" style={{ color: color.onDarkMuted, flex: 1 }}>
            Prototype: shares a link to the app. Real passes arrive with payments.
          </AppText>
          <Button label="Share" kind="secondary" dark small onPress={shareGuestPass} testID="guest-pass-share" />
        </Row>
      </View>

      {/* Utility */}
      <Gap size="xl" />
      {services.signOut ? (
        <ListRow label="Sign out" sub="your data stays safely in your account" onPress={signOut} />
      ) : null}

      {/* Member-since wordmark footer */}
      <Gap size="xxl" />
      <Pressable accessibilityRole="none" style={{ alignItems: 'center' }}>
        <AppText variant="title" center>
          {APP_NAME}
        </AppText>
        <Gap size="xs" />
        <AppText variant="caption" muted center>
          Member since{' '}
          {data.profile
            ? new Date(data.profile.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : '·'}
        </AppText>
      </Pressable>
      <Gap size="lg" />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  statCell: { width: '50%', marginBottom: space.md, paddingRight: 8 },
  statNum: { fontFamily: font.display, fontSize: 36, lineHeight: 40 },
  badgeWrap: { alignItems: 'center', width: 64 },
  badge: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGlow: {
    shadowColor: '#99b955',
    shadowOpacity: 0.65,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  badgeNum: { fontFamily: font.groteskBold, fontSize: 20, color: color.onDark },
  passCard: {
    backgroundColor: color.dark,
    borderRadius: radius.lg,
    padding: space.lg,
  },
});
