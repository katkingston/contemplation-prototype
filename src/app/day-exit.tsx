/** C7 — Day Exit. Close the day; next open resumes where left off. */
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Button, Gap } from '@/components/ui';
import { dayExit } from '@/content/copy';
import { useApp } from '@/services/provider';
import { space } from '@/theme/tokens';

export default function DayExit() {
  const { data } = useApp();
  // Rotate the closing line by days practiced so it changes across the series.
  const daysPracticed = new Set(data.sessions.map((s) => s.date)).size;
  const closer = dayExit.closers[daysPracticed % dayExit.closers.length];

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#221c16', '#57503f']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.content}>
        <View style={{ flex: 1 }} />
        <AppText variant="title" dark center>
          {dayExit.title}
        </AppText>
        <Gap size="md" />
        <AppText variant="body" dark muted center>
          {dayExit.body}
        </AppText>
        <Gap size="sm" />
        <AppText variant="body" dark muted center>
          {dayExit.body2}
        </AppText>
        <Gap size="sm" />
        <AppText variant="body" dark muted center>
          {dayExit.body3}
        </AppText>
        <Gap size="lg" />
        <AppText variant="body" dark center style={{ fontStyle: 'italic' }}>
          {closer}
        </AppText>
        <View style={{ flex: 1 }} />
        <Button label="Done" dark onPress={() => router.replace('/home')} testID="day-exit-done" />
        <Gap size="lg" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#221c16' },
  content: { flex: 1, paddingHorizontal: space.lg },
});
