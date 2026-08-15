/**
 * Learn — editorial index (Jul 30 designs): dark gradient hero band with the
 * lowercase "learn" title, then the featured article (title, excerpt, mono
 * meta) and the remaining articles as hairline title rows.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { TabScreen } from '@/components/BottomNav';
import { Dither } from '@/components/Dither';
import { AppText, Gap } from '@/components/ui';
import { POSTS } from '@/content/posts';
import { color, seriesPalettes, space } from '@/theme/tokens';

export default function Learn() {
  const [featured, ...rest] = POSTS;
  const palette = seriesPalettes['s1-impermanence'];
  const open = (postId: string) =>
    router.push({ pathname: '/post/[postId]', params: { postId } });

  return (
    <TabScreen active="journey" padded={false}>
      {/* Dark hero band bleeding to the screen edges. */}
      <View style={styles.heroBand}>
        <LinearGradient
          colors={[palette[0], palette[1]]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Dither />
        <AppText variant="displayLower" dark>
          learn
        </AppText>
      </View>
      <View style={{ paddingHorizontal: space.lg }}>
        <Gap size="xl" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={featured.title}
          onPress={() => open(featured.id)}
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          testID={`post-${featured.id}`}>
          <AppText variant="bodyBold">{featured.title}</AppText>
          <Gap size="sm" />
          <AppText variant="body" muted>
            {featured.excerpt}
          </AppText>
          <Gap size="sm" />
          <AppText variant="label" muted>
            {featured.tag} · {featured.minutes} min read
          </AppText>
        </Pressable>
        <Gap size="xl" />
        {rest.map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            accessibilityLabel={p.title}
            onPress={() => open(p.id)}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
            testID={`post-${p.id}`}>
            <AppText variant="bodyBold" style={{ flex: 1 }}>
              {p.title}
            </AppText>
            <AppText variant="body" muted>
              →
            </AppText>
          </Pressable>
        ))}
        <View style={styles.endRule} />
        <Gap size="md" />
        <AppText variant="caption" muted>
          More learnings coming with each new series.
        </AppText>
      </View>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  heroBand: {
    height: 220,
    justifyContent: 'flex-start',
    paddingTop: space.xl,
    paddingHorizontal: space.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.muted,
  },
  endRule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.muted },
});
