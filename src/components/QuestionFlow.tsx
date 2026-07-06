/**
 * QuestionFlow — one required question per slide with a step indicator.
 * Used by the intake questionnaire (O8) and the series-completion survey (S3).
 * Answers are saved to the backend and never shown back to the user.
 */
import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import {
  AppText,
  Button,
  ChipGroup,
  Dots,
  Gap,
  MultiChipGroup,
  Screen,
  Spacer,
} from '@/components/ui';
import type { AnswerValue } from '@/services/types';
import { color, radius, space, type } from '@/theme/tokens';

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
}: {
  questions: Question[];
  onComplete: (answers: Record<string, AnswerValue>) => void;
  completeLabel?: string;
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

  return (
    <Screen scroll={false}>
      <Gap size="lg" />
      <Dots count={questions.length} active={step} />
      <Gap size="xl" />
      <AppText variant="title">{q.prompt}</AppText>
      <Gap size="lg" />
      {q.kind === 'scale' && (
        <View>
          <ChipGroup
            options={Array.from({ length: (q.max ?? 5) - (q.min ?? 1) + 1 }, (_, i) => (q.min ?? 1) + i)}
            value={typeof value === 'number' ? value : null}
            onChange={(v) => set(v)}
          />
          <Gap size="sm" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="small" muted>
              {q.minLabel}
            </AppText>
            <AppText variant="small" muted>
              {q.maxLabel}
            </AppText>
          </View>
        </View>
      )}
      {q.kind === 'multi' && (
        <View>
          <MultiChipGroup
            options={q.options ?? []}
            values={Array.isArray(value) ? value : []}
            onToggle={(opt) => {
              const cur = Array.isArray(value) ? value : [];
              set(cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt]);
            }}
          />
          {otherSelected && (
            <TextInput
              value={otherTexts[q.id] ?? ''}
              onChangeText={(t) => setOtherTexts((o) => ({ ...o, [q.id]: t }))}
              accessibilityLabel="Tell us who"
          placeholder="Tell us who…"
              placeholderTextColor={color.muted}
              style={{
                ...type.body,
                marginTop: space.md,
                borderWidth: 1,
                borderColor: color.line,
                borderRadius: radius.md,
                padding: space.md,
                backgroundColor: color.faint,
                color: color.ink,
              }}
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
          style={{
            ...type.body,
            minHeight: 120,
            borderWidth: 1,
            borderColor: color.line,
            borderRadius: radius.md,
            padding: space.md,
            backgroundColor: color.faint,
            textAlignVertical: 'top',
            color: color.ink,
          }}
          testID="question-text-input"
        />
      )}
      <Spacer />
      <AppText variant="caption" muted center>
        All questions are required · answers are private and never shown back to you
      </AppText>
      <Gap size="sm" />
      <Button
        label={step + 1 < questions.length ? 'Next' : completeLabel}
        onPress={next}
        disabled={!answered}
        testID="question-next"
      />
      <Gap size="lg" />
    </Screen>
  );
}
