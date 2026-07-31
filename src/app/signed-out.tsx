/**
 * Signed out — confirmation screen (Jul 30 designs): taupe surface, spiral,
 * mono "you are signed out", and a close link back to the start.
 */
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Gap, TextLink } from '@/components/ui';
import { color, space } from '@/theme/tokens';

export default function SignedOut() {
  return (
    <View style={styles.root} testID="signed-out-screen">
      <SafeAreaView style={styles.content}>
        <View style={styles.center}>
          <AppText style={styles.spiral as never}>꩜</AppText>
          <Gap size="xl" />
          <AppText variant="monoBody" style={{ color: color.onOverlay }} center>
            you are signed out
          </AppText>
          <Gap size="md" />
          <TextLink label="close" dark onPress={() => router.replace('/')} testID="signed-out-close" />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.overlay },
  content: { flex: 1, paddingHorizontal: space.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  spiral: { fontSize: 34, color: color.onOverlay, opacity: 0.85 },
});
