/**
 * Learnings — editorial index (Open Studio/Experiences reference): full-bleed
 * artwork card, big title, description, per post. First post is featured.
 */
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { TabScreen } from '@/components/BottomNav';
import { SeriesArt } from '@/components/SeriesArt';
import { AppText, Gap } from '@/components/ui';
import { POSTS } from '@/content/posts';
import { color, radius, space } from '@/theme/tokens';

export default function Learn() {
  const [featured, ...rest] = POSTS;

  return (
    <TabScreen active="journey">
      <Gap size="xl" />
      <AppText variant="label" muted>
        Learnings
      </AppText>
      <Gap size="md" />

      {/* Featured post: Experiences-style card */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={featured.title}
        onPress={() => router.push({ pathname: '/post/[postId]', params: { postId: featured.id } })}
        style={({ pressed }) => [pressed && { opacity: 0.8 }]}
        testID={`post-${featured.id}`}>
        <View style={styles.featuredArt}>
          <SeriesArt gradient={featured.gradient} accent={featured.accent} seed={2} style={StyleSheet.absoluteFill as never} />
        </View>
        <Gap size="md" />
        <AppText variant="title">{featured.title}</AppText>
        <Gap size="sm" />
        <AppText variant="body" muted>
          {featured.excerpt}
        </AppText>
        <Gap size="xs" />
        <AppText variant="label" muted>
          {featured.tag} · {featured.minutes} min read
        </AppText>
      </Pressable>

      <Gap size="xl" />
      {rest.map((p, i) => (
        <Pressable
          key={p.id}
          accessibilityRole="button"
          accessibilityLabel={p.title}
          onPress={() => router.push({ pathname: '/post/[postId]', params: { postId: p.id } })}
          style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
          testID={`post-${p.id}`}>
          <View style={styles.thumb}>
            <SeriesArt gradient={p.gradient} accent={p.accent} seed={i + 4} style={StyleSheet.absoluteFill as never} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="label" muted>
              {p.tag} · {p.minutes} min read
            </AppText>
            <AppText variant="bodyBold">{p.title}</AppText>
          </View>
          <AppText variant="body" muted>
            {'›'}
          </AppText>
        </Pressable>
      ))}
      <Gap size="md" />
      <AppText variant="caption" muted>
        More learnings coming with each new series.
      </AppText>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  featuredArt: { height: 300, borderRadius: radius.sm, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.line,
  },
  thumb: { width: 64, height: 64, borderRadius: radius.sm, overflow: 'hidden' },
});
