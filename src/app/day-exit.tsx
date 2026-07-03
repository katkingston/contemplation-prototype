/** C7 — Day Exit. Close the day; next open resumes where left off. */
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Button, Gap } from '@/components/ui';
import { dayExit } from '@/content/copy';
import { color } from '@/theme/tokens';
import { useApp } from '@/services/provider';
import { space } from '@/theme/tokens';

export default function DayExit() {
  const { data } = useApp();
  // Rotate the closing line by days practiced so it changes across the series.
  const daysPracticed = new Set(data.sessions.map((s) => s.date)).size;
  const closer = dayExit.closers[daysPracticed % dayExit.closers.length];

  return (
    <View style={styles.root}>
      <LinearGradient colors={[color.dark, '#4a5233']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.content}>
        <View style={{ flex: 1 }} />
        <AppText variant="title" dark>
          {dayExit.title}
        </AppText>
        <Gap size="md" />
        <AppText variant="body" dark muted>
          {dayExit.body}
        </AppText>
        <Gap size="sm" />
        <AppText variant="body" dark muted>
          {dayExit.body2}
        </AppText>
        <Gap size="sm" />
        <AppText variant="body" dark muted>
          {dayExit.body3}
        </AppText>
        <Gap size="lg" />
        <AppText variant="body" dark style={{ fontStyle: 'italic' }}>
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
  root: { flex: 1, backgroundColor: color.dark },
  content: { flex: 1, paddingHorizontal: space.lg },
});
