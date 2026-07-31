/**
 * Style guide — the living design system, rendered.
 * Not part of the user flow; reachable from Settings → Testing tools.
 * Every token and component variant in one scrollable review surface.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CrisisButton } from '@/components/CrisisButton';
import { SeriesDashes } from '@/components/SeriesDashes';
import {
  AppText,
  Button,
  ChipGroup,
  Dots,
  Gap,
  ListRow,
  MonoHeader,
  MultiChipGroup,
  Row,
  Screen,
  StatusPill,
  TextLink,
  Wordmark,
} from '@/components/ui';
import { SERIES } from '@/content/series';
import { color, radius, seriesPalettes, space, type } from '@/theme/tokens';

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <View style={{ width: 104, marginBottom: space.sm }}>
      <View
        style={{
          height: 44,
          borderRadius: radius.sm,
          backgroundColor: value,
          borderWidth: 1,
          borderColor: color.line,
        }}
      />
      <AppText variant="caption">{name}</AppText>
      <AppText variant="caption" muted>
        {value}
      </AppText>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <>
      <Gap size="xl" />
      <AppText variant="heading">{children}</AppText>
      <Gap size="md" />
    </>
  );
}

export default function StyleGuide() {
  return (
    <Screen testID="styleguide">
      <Gap size="lg" />
      <Row between>
        <AppText variant="title">Design system</AppText>
        <Button label="Close" kind="ghost" small onPress={() => router.back()} />
      </Row>
      <AppText variant="small" muted>
        Living style guide — every visual decision in the app flows from these tokens.
      </AppText>

      <SectionTitle>Color — core</SectionTitle>
      <View style={styles.wrapRow}>
        {Object.entries(color).map(([k, v]) => (
          <Swatch key={k} name={k} value={v} />
        ))}
      </View>

      <SectionTitle>Color — series continuums</SectionTitle>
      {Object.entries(seriesPalettes).map(([k, stops]) => (
        <View key={k} style={{ marginBottom: space.sm }}>
          <LinearGradient
            colors={[stops[0], stops[1], stops[2]]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ height: 36, borderRadius: radius.sm }}
          />
          <AppText variant="caption" muted>
            {k} · {stops.join(' → ')}
          </AppText>
        </View>
      ))}

      <SectionTitle>Type scale</SectionTitle>
      {(Object.keys(type) as (keyof typeof type)[]).map((k) => (
        <View key={k} style={{ marginBottom: space.sm }}>
          <AppText variant={k}>{k} — Everything changes.</AppText>
          <AppText variant="caption" muted>
            {type[k].fontSize}px / {type[k].lineHeight} · {type[k].fontFamily}
          </AppText>
        </View>
      ))}

      <SectionTitle>Spacing & radii</SectionTitle>
      <Row>
        {Object.entries(space).map(([k, v]) => (
          <View key={k} style={{ alignItems: 'center' }}>
            <View style={{ width: v, height: v, backgroundColor: color.accent, borderRadius: 2 }} />
            <AppText variant="caption" muted>
              {k} {v}
            </AppText>
          </View>
        ))}
      </Row>
      <Gap size="md" />
      <Row>
        {Object.entries(radius).map(([k, v]) => (
          <View key={k} style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderWidth: 1.5,
                borderColor: color.ink,
                borderRadius: Math.min(v, 22),
              }}
            />
            <AppText variant="caption" muted>
              {k} {v}
            </AppText>
          </View>
        ))}
      </Row>

      <SectionTitle>Buttons</SectionTitle>
      <Button label="Primary" onPress={() => {}} />
      <Gap size="sm" />
      <Button label="Secondary" kind="secondary" onPress={() => {}} />
      <Gap size="sm" />
      <Button label="Ghost" kind="ghost" onPress={() => {}} />
      <Gap size="sm" />
      <Button label="Danger" kind="danger" onPress={() => {}} />
      <Gap size="sm" />
      <Button label="Disabled" onPress={() => {}} disabled />
      <Gap size="md" />
      <View style={styles.darkPanel}>
        <Button label="Primary on dark" dark onPress={() => {}} />
        <Gap size="sm" />
        <Button label="Secondary on dark" kind="secondary" dark onPress={() => {}} />
      </View>

      <SectionTitle>Chips & pills</SectionTitle>
      <ChipGroup options={[1, 2, 3, 5]} value={2} onChange={() => {}} labels={(m) => `${m} min`} />
      <Gap size="sm" />
      <MultiChipGroup options={['Friends', 'Family', 'Other']} values={['Family']} onToggle={() => {}} />
      <Gap size="md" />
      <Row>
        <StatusPill label="✓ Done" kind="done" />
        <StatusPill label="Today" kind="progress" />
        <StatusPill label="Upcoming" kind="locked" />
        <StatusPill label="Available" kind="neutral" />
      </Row>
      <Gap size="md" />
      <Row between>
        <AppText variant="small" muted>
          Crisis affordance
        </AppText>
        <CrisisButton />
      </Row>

      <SectionTitle>List rows</SectionTitle>
      <ListRow label="Row with chevron" sub="supporting text" onPress={() => {}} />
      <ListRow label="Row with status" right={<StatusPill label="Today" kind="progress" />} />
      <ListRow label="Danger row" sub="destructive action" danger onPress={() => {}} />

      <SectionTitle>Step indicator</SectionTitle>
      <Dots count={4} active={1} />

      <SectionTitle>Jul 30 design language</SectionTitle>
      <Wordmark />
      <Gap size="md" />
      <MonoHeader code="01.6" title={SERIES[0].title} />
      <Gap size="md" />
      <SeriesDashes total={SERIES[0].contemplations.length} done={2} active />
      <Gap size="md" />
      <Row>
        <TextLink label="Resume," onPress={() => {}} />
        <TextLink label="End" muted onPress={() => {}} />
      </Row>
      <Gap size="sm" />
      <TextLink label="Contemplate" arrow onPress={() => {}} />
      <Gap size="md" />
      <ListRow label="Push notifications" rightLabel="Off" right={<View />} onPress={() => {}} />
      <ListRow label="Daily contemplation time" rightLabel="6:00 PM" right={<View />} onPress={() => {}} />

      <SectionTitle>Contemplation surface</SectionTitle>
      <View style={{ borderRadius: radius.lg, overflow: 'hidden' }}>
        <LinearGradient
          colors={[SERIES[0].contemplations[0].gradient[0], SERIES[0].contemplations[0].gradient[1]]}
          style={{ padding: space.xl, minHeight: 220, justifyContent: 'center' }}>
          <AppText variant="contemplation" center style={{ color: '#efe9db' }}>
            {SERIES[0].contemplations[0].prompt}
          </AppText>
        </LinearGradient>
      </View>
      <Gap size="xl" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  darkPanel: {
    backgroundColor: color.dark,
    padding: space.md,
    borderRadius: radius.md,
  },
});
