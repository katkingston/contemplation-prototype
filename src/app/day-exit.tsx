/** C7 — Day Exit. Close the day; next open resumes where left off. */
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Button, Gap } from '@/components/ui';
import { dayExit } from '@/content/copy';
import { space } from '@/theme/tokens';

export default function DayExit() {
  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1c2230', '#3e4f66']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.content}>
        <View style={{ flex: 1 }} />
        <AppText variant="title" dark center>
          {dayExit.title}
        </AppText>
        <Gap size="md" />
        <AppText variant="body" dark muted center>
          {dayExit.body}
        </AppText>
        <View style={{ flex: 1 }} />
        <Button label="Done" dark onPress={() => router.replace('/home')} testID="day-exit-done" />
        <Gap size="lg" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#141417' },
  content: { flex: 1, paddingHorizontal: space.lg },
});
