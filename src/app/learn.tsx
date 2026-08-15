/**
 * J3 Learn — editorial index. Measured off the Figma frame (390x933): the
 * gradient hero runs the full width and 496 deep with the lowercase "learn"
 * title at 61, then the featured article (title 528, excerpt 561, mono meta
 * 636) and the remaining articles as hairline rows on a 46pt pitch, each with
 * its read time set right in mono caps.
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

/** Figma J3: hero 0→496, "learn" baseline block at 61. */
const HERO_HEIGHT = 496;
const HERO_TITLE_TOP = 61;

export default function Learn() {
  const [featured, ...rest] = POSTS;
  const palette = seriesPalettes['s1-impermanence'];
  const open = (postId: string) =>
    router.push({ pathname: '/post/[postId]', params: { postId } });

  return (
    <TabScreen active="journey" padded={false} bleedTop>
      {/* Dark hero band bleeding to the screen edges and under the status bar. */}
      <View style={styles.heroBand}>
        <LinearGradient
          colors={[palette[0], palette[1]]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Dither />
        <AppText variant="heroTitle" dark>
          learn
        </AppText>
      </View>
      <View style={styles.body}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={featured.title}
          onPress={() => open(featured.id)}
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          testID={`post-${featured.id}`}>
          <AppText variant="bodyBold">{featured.title}</AppText>
          <View style={{ height: 12 }} />
          <AppText variant="body" muted>
            {featured.excerpt}
          </AppText>
          <View style={{ height: 12 }} />
          <AppText variant="label" muted>
            {featured.tag} · {featured.minutes} min read
          </AppText>
        </Pressable>
        <View style={{ height: 32 }} />
        {rest.map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            accessibilityLabel={`${p.title}, ${p.minutes} minute read`}
            onPress={() => open(p.id)}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
            testID={`post-${p.id}`}>
            <AppText variant="bodyBold" style={{ flex: 1 }}>
              {p.title}
            </AppText>
            <AppText variant="label" muted>
              {p.minutes} min
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
    height: HERO_HEIGHT,
    paddingTop: HERO_TITLE_TOP,
    paddingHorizontal: space.lg,
  },
  // Hero ends at 496, featured title sits at 528.
  body: { paddingHorizontal: space.lg, paddingTop: 32 },
  row: {
    // 46pt pitch: a 15/21 title with 12.5 either side of it, ruled above.
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: 12.5,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.muted,
  },
  endRule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.muted },
});
