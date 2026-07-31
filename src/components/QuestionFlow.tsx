/**
 * QuestionFlow — one required question per slide (Jul 30 designs): mono caps
 * header ("01 — BASELINE" left, "02/05" right, both computed from props),
 * centered bold prompt, boxed scale numbers or hairline multi-select rows,
 * and an underlined "Next question" link.
 * Used by the intake questionnaire (O8) and the series-completion survey (S3).
 * Answers are saved to the backend and never shown back to the user.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText, Gap, Row, Screen, Spacer, TextLink } from '@/components/ui';
import type { AnswerValue } from '@/services/types';
import { color, font, space, type } from '@/theme/tokens';

export interface Question {
  id: string;
  prompt: string;
  kind: 'scale' | 'multi' | 'text';
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  options?: string[];
}

export function QuestionFlow({
  questions,
  onComplete,
  completeLabel = 'Complete',
  headerLabel = '01 — Baseline',
}: {
  questions: Question[];
  onComplete: (answers: Record<string, AnswerValue>) => void;
  completeLabel?: string;
  /** Mono caps header, left side ("01 — Baseline" / "02 — Survey"). */
  headerLabel?: string;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});
  const q = questions[step];
  const value = answers[q.id];
  const otherSelected = q.kind === 'multi' && Array.isArray(value) && value.includes('Other');

  const answered =
    q.kind === 'text'
      ? typeof value === 'string' && value.trim().length > 0
      : q.kind === 'multi'
        ? Array.isArray(value) && value.length > 0
        : typeof value === 'number';

  const set = (v: AnswerValue) => setAnswers((a) => ({ ...a, [q.id]: v }));

  const next = () => {
    // Fold typed "Other" text into the stored answer.
    let final = answers;
    const other = otherTexts[q.id]?.trim();
    if (q.kind === 'multi' && Array.isArray(value) && value.includes('Other') && other) {
      final = {
        ...answers,
        [q.id]: value.map((v) => (v === 'Other' ? `Other: ${other}` : v)),
      };
      setAnswers(final);
    }
    if (step + 1 < questions.length) setStep(step + 1);
    else onComplete(final);
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <Screen scroll={false}>
      <Gap size="md" />
      <Row between>
        <AppText variant="label" muted>
          {headerLabel}
        </AppText>
        <AppText variant="label" muted>
          {`${pad(step + 1)}/${pad(questions.length)}`}
        </AppText>
      </Row>
      <Gap size="xxl" />
      <Gap size="xl" />
      <AppText variant="titleLower" center style={{ fontSize: 22, lineHeight: 28 }}>
        {q.prompt}
      </AppText>
      <Gap size="xl" />
      {q.kind === 'scale' && (
        <View>
          <View style={styles.scaleRow}>
            {Array.from(
              { length: (q.max ?? 5) - (q.min ?? 1) + 1 },
              (_, i) => (q.min ?? 1) + i,
            ).map((n) => {
              const sel = value === n;
              return (
                <Pressable
                  key={n}
                  accessibilityRole="button"
                  accessibilityState={{ selected: sel }}
                  onPress={() => set(n)}
                  style={[styles.scaleBox, sel && styles.scaleBoxSelected]}>
                  <AppText
                    variant={sel ? 'bodyBold' : 'body'}
                    style={
                      {
                        fontFamily: font.mono,
                        textDecorationLine: sel ? 'underline' : 'none',
                      } as never
                    }>
                    {n}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <Gap size="sm" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="caption" muted>
              {q.minLabel}
            </AppText>
            <AppText variant="caption" muted style={{ textAlign: 'right' }}>
              {q.maxLabel}
            </AppText>
          </View>
        </View>
      )}
      {q.kind === 'multi' && (
        <View>
          {(q.options ?? []).map((opt) => {
            const cur = Array.isArray(value) ? value : [];
            const sel = cur.includes(opt);
            return (
              <Pressable
                key={opt}
                accessibilityRole="button"
                accessibilityState={{ selected: sel }}
                onPress={() => set(sel ? cur.filter((x) => x !== opt) : [...cur, opt])}
                style={({ pressed }) => [styles.optionRow, pressed && { opacity: 0.6 }]}>
                <AppText
                  variant={sel ? 'bodyBold' : 'body'}
                  style={
                    {
                      fontFamily: font.mono,
                      fontSize: 14,
                      textDecorationLine: sel ? 'underline' : 'none',
                    } as never
                  }>
                  {opt}
                </AppText>
              </Pressable>
            );
          })}
          <View style={styles.optionEndRule} />
          {otherSelected && (
            <TextInput
              value={otherTexts[q.id] ?? ''}
              onChangeText={(t) => setOtherTexts((o) => ({ ...o, [q.id]: t }))}
              accessibilityLabel="Tell us who"
              placeholder="Tell us who…"
              placeholderTextColor={color.muted}
              style={styles.otherInput}
              testID="other-text-input"
            />
          )}
        </View>
      )}
      {q.kind === 'text' && (
        <TextInput
          multiline
          value={typeof value === 'string' ? value : ''}
          onChangeText={(t) => set(t)}
          accessibilityLabel="Your answer"
          placeholder="Write as little or as much as you like…"
          placeholderTextColor={color.muted}
          style={styles.textInput}
          testID="question-text-input"
        />
      )}
      <Spacer />
      <AppText variant="caption" muted center>
        All questions are required · answers are private and never shown back to you
      </AppText>
      <Gap size="md" />
      <View style={{ alignItems: 'center' }}>
        <TextLink
          label={step + 1 < questions.length ? 'Next question' : completeLabel}
          onPress={next}
          disabled={!answered}
          testID="question-next"
        />
      </View>
      <Gap size="lg" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scaleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    justifyContent: 'center',
  },
  scaleBox: {
    minWidth: 48,
    height: 48,
    borderWidth: 1,
    borderColor: color.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.sm,
  },
  scaleBoxSelected: { borderColor: color.ink, backgroundColor: color.faint },
  optionRow: {
    paddingVertical: 13,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.muted,
  },
  optionEndRule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.muted },
  otherInput: {
    ...type.body,
    marginTop: space.md,
    borderBottomWidth: 1,
    borderBottomColor: color.muted,
    paddingVertical: space.sm,
    color: color.ink,
  },
  textInput: {
    ...type.monoBody,
    minHeight: 120,
    borderBottomWidth: 1,
    borderBottomColor: color.muted,
    paddingVertical: space.sm,
    textAlignVertical: 'top',
    color: color.ink,
  },
});
