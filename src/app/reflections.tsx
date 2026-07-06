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
  const revealed = data.diary.filter((e) => e.isRevealed);

  return (
    <TabScreen active="menu">
      <Gap size="xl" />
      <AppText variant="title">Journal</AppText>
      <Gap size="sm" />
      <AppText variant="small" muted>
        Reflections are revealed when you complete their series — then they live here.
      </AppText>
      {revealed.length === 0 ? (
        <>
          <Gap size="xl" />
          <AppText variant="body" muted>
            Nothing revealed yet. Keep sitting with the daily contemplations — when a
            series completes, everything you wrote and recorded returns to you at once.
          </AppText>
        </>
      ) : (
        orderedSeries().map((s) => {
          const entries = revealed.filter((e) => e.seriesId === s.id);
          if (entries.length === 0) return null;
          return (
            <View key={s.id}>
              <Eyebrow>{`${getSeries(s.id)?.title ?? s.id}`}</Eyebrow>
              {entries.map((e) => (
                <View key={e.id} style={{ marginBottom: 20 }}>
                  <AppText variant="label" muted>
                    {new Date(e.createdAt).toDateString()}
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
              ))}
            </View>
          );
        })
      )}
    </TabScreen>
  );
}
