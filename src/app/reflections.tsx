/**
 * Journal — revealed reflections, grouped by series. Entries stay hidden
 * until a series completes (hard rule); this page holds what has been
 * revealed so far.
 */
import React from 'react';
import { View } from 'react-native';
import { TabScreen } from '@/components/BottomNav';
import { MemoPlayer } from '@/components/diary';
import { AppText, Eyebrow, Gap } from '@/components/ui';
import { getSeries, orderedSeries } from '@/content/series';
import { useApp } from '@/services/provider';

export default function Reflections() {
  const { data } = useApp();

  return (
    <TabScreen active="journey">
      <Gap size="xl" />
      <AppText variant="title">Your Journal</AppText>
      <Gap size="sm" />
      <AppText variant="small" muted>
        Every reflection is registered the day you write it. The words themselves are
        revealed when you complete their series.
      </AppText>
      {data.diary.length === 0 ? (
        <>
          <Gap size="xl" />
          <AppText variant="body" muted>
            Nothing here yet. Your first reflection arrives with your first
            contemplation.
          </AppText>
        </>
      ) : (
        orderedSeries().map((s) => {
          const entries = data.diary.filter((e) => e.seriesId === s.id);
          if (entries.length === 0) return null;
          return (
            <View key={s.id}>
              <Eyebrow>{`${getSeries(s.id)?.title ?? s.id}`}</Eyebrow>
              {entries.map((e) =>
                e.isRevealed ? (
                  <View key={e.id} style={{ marginBottom: 20 }}>
                    <AppText variant="label" muted>
                      {new Date(e.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </AppText>
                    <Gap size="xs" />
                    <AppText variant="bodyBold">{e.prompt}</AppText>
                    {e.text ? (
                      <>
                        <Gap size="xs" />
                        <AppText variant="body">{e.text}</AppText>
                      </>
                    ) : null}
                    {e.audioUri ? (
                      <>
                        <Gap size="sm" />
                        <MemoPlayer uri={e.audioUri} durationSec={e.audioDurationSec} />
                      </>
                    ) : null}
                  </View>
                ) : (
                  // Registered but not yet revealed: date and series only, grayed.
                  <View key={e.id} style={{ marginBottom: 20, opacity: 0.45 }}>
                    <AppText variant="label" muted>
                      {new Date(e.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </AppText>
                    <Gap size="xs" />
                    <AppText variant="body" muted>
                      A reflection is held here. It reveals when the series completes.
                    </AppText>
                  </View>
                ),
              )}
            </View>
          );
        })
      )}
    </TabScreen>
  );
}
