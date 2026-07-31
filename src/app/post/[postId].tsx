/**
 * Learn — reading page for a single post (Jul 30 designs): mono meta row
 * (tag left, read time right), big title, artwork, paragraphs, and a
 * "Back to all / Next article" link pair.
 */
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SeriesArt } from '@/components/SeriesArt';
import { AppText, Gap, Row, TextLink } from '@/components/ui';
import { getPost, POSTS } from '@/content/posts';
import { color, radius, space } from '@/theme/tokens';

export default function PostPage() {
  const params = useLocalSearchParams<{ postId?: string }>();
  const post = getPost(params.postId ?? '');
  if (!post) {
    router.replace('/learn');
    return null;
  }
  const idx = POSTS.findIndex((p) => p.id === post.id);
  const next = POSTS[(idx + 1) % POSTS.length];

  return (
    <SafeAreaView style={styles.shell} edges={['top', 'left', 'right']} testID="post-screen">
      <ScrollView contentContainerStyle={{ paddingBottom: space.xxl, paddingHorizontal: space.lg }}>
        <Gap size="md" />
        <Row between>
          <AppText variant="label" muted>
            {post.tag}
          </AppText>
          <AppText variant="label" muted>
            {post.minutes} min read
          </AppText>
        </Row>
        <Gap size="lg" />
        <AppText variant="titleLower">{post.title}</AppText>
        <Gap size="lg" />
        <View style={styles.art}>
          <SeriesArt
            gradient={post.gradient}
            accent={post.accent}
            seed={2}
            style={StyleSheet.absoluteFill as never}
          />
        </View>
        <Gap size="lg" />
        {post.paragraphs.map((p, i) => (
          <AppText key={i} variant="body" style={{ marginBottom: space.md, lineHeight: 26 }}>
            {p}
          </AppText>
        ))}
        <Gap size="xl" />
        <Row between>
          <TextLink
            label="Back to all"
            muted
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/learn'))}
            testID="post-back"
          />
          {POSTS.length > 1 ? (
            <TextLink
              label="Next article"
              muted
              onPress={() =>
                router.replace({ pathname: '/post/[postId]', params: { postId: next.id } })
              }
              testID="post-next"
            />
          ) : null}
        </Row>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: color.paper },
  art: { height: 300, borderRadius: radius.sm, overflow: 'hidden' },
});
