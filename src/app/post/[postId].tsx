/** Learnings — reading page for a single post. */
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SeriesArt } from '@/components/SeriesArt';
import { AppText, Button, Gap } from '@/components/ui';
import { getPost } from '@/content/posts';
import { color, space } from '@/theme/tokens';

export default function PostPage() {
  const params = useLocalSearchParams<{ postId?: string }>();
  const post = getPost(params.postId ?? '');
  if (!post) {
    router.replace('/learn');
    return null;
  }
  return (
    <SafeAreaView style={styles.shell} edges={['top', 'left', 'right']} testID="post-screen">
      <ScrollView contentContainerStyle={{ paddingBottom: space.xxl }}>
        <View style={styles.hero}>
          <SeriesArt gradient={post.gradient} accent={post.accent} seed={2} style={StyleSheet.absoluteFill as never} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/learn'))}
            style={styles.back}>
            <AppText variant="heading" style={{ color: color.onDark }}>
              ←
            </AppText>
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: space.lg }}>
          <Gap size="lg" />
          <AppText variant="label" muted>
            {post.tag} · {post.minutes} min read
          </AppText>
          <Gap size="sm" />
          <AppText variant="title">{post.title}</AppText>
          <Gap size="lg" />
          {post.paragraphs.map((p, i) => (
            <AppText key={i} variant="body" style={{ marginBottom: space.md, lineHeight: 26 }}>
              {p}
            </AppText>
          ))}
          <Gap size="lg" />
          <Button label="Back to Learnings" kind="ghost" onPress={() => router.replace('/learn')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: color.paper },
  hero: { height: 240 },
  back: {
    position: 'absolute',
    top: space.md,
    left: space.lg,
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
});
