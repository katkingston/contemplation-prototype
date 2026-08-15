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
import { anchor, color, radius, space } from '@/theme/tokens';

export default function PostPage() {
  const params = useLocalSearchParams<{ postId?: string }>();
  const post = getPost(params.postId ?? '');
  if (!post) {
    router.replace('/learn');
    return null;
  }
  const idx = POSTS.findIndex((p) => p.id === post.id);
  const next = POSTS[(idx + 1) % POSTS.length];

  // No 'top' edge: the 77 padding is measured from the true top of the frame,
  // status bar included, like every other mono-header screen.
  return (
    <SafeAreaView style={styles.shell} edges={['left', 'right']} testID="post-screen">
      <ScrollView contentContainerStyle={styles.content}>
        <Row between>
          <AppText variant="label" muted>
            {post.tag}
          </AppText>
          <AppText variant="label" muted>
            {post.minutes} min read
          </AppText>
        </Row>
        <View style={{ height: 20 }} />
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
        {/* Body is the DS body role — 15/140%, same as the disclaimer's long
            copy (O1). A looser leading here would be off-system. */}
        {post.paragraphs.map((p, i) => (
          <AppText key={i} variant="body" style={{ marginBottom: space.md }}>
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
  // Mono meta row on the same line as every other flow screen (77).
  content: {
    paddingBottom: space.xxl,
    paddingHorizontal: space.lg,
    paddingTop: anchor.monoHeader,
  },
  art: { height: 300, borderRadius: radius.sm, overflow: 'hidden' },
});
