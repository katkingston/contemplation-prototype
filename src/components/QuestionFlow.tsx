/**
 * QuestionFlow — one required question per slide (Jul 30 designs): mono caps
 * header ("01 — BASELINE" left, "02/05" right, both computed from props),
 * centered bold prompt, boxed scale numbers or hairline multi-select rows,
 * and an underlined "Next question" link.
 * Used by the intake questionnaire (O8) and the series-completion survey (S3).
 * Answers are saved to the backend and never shown back to the user.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { Anchored, AnchoredBottom, AppText, Row, Stage, TextLink, useAnchor } from '@/components/ui';
import type { AnswerValue } from '@/services/types';
import { anchor, anchorBottom, color, font, space, type } from '@/theme/tokens';

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
  // Long option lists must clear the bottom link on short phone viewports —
  // the row padding compresses with the grid (text size never changes).
  const ax = useAnchor();
  const { width: winWidth } = useWindowDimensions();
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

  // O8 / Q pin the whole slide: header 77, prompt 221, scale 392 (or the
  // option list from 341 on a 41pt pitch), endpoint labels 459/467, and the
  // link centred at 760. Nothing here stacks.
  return (
    <Stage>
      <Anchored y={anchor.monoHeader}>
        <Row between>
          <AppText variant="label" muted>
            {headerLabel}
          </AppText>
          <AppText variant="label" muted>
            {`${pad(step + 1)}/${pad(questions.length)}`}
          </AppText>
        </Row>
      </Anchored>
      <Anchored y={anchor.question}>
        <AppText variant="titleLower" center style={{ fontSize: 20, lineHeight: 24 }}>
          {q.prompt}
        </AppText>
      </Anchored>
      {q.kind === 'scale' && (
        <>
          <Anchored y={anchor.scaleRow} style={styles.scaleRow}>
            {(() => {
              const opts = Array.from(
                { length: (q.max ?? 5) - (q.min ?? 1) + 1 },
                (_, i) => (q.min ?? 1) + i,
              );
              // A 1–10 scale can't keep the 39-wide boxes of the 5-point
              // design — width adapts so the whole row always fits the
              // measure (Kat, Aug 19: 10 was running off-screen).
              const measure = (winWidth || 390) - space.lg * 2;
              const boxW = Math.min(39, Math.floor((measure - (opts.length - 1) * 4) / opts.length));
              return opts.map((n) => {
              const sel = value === n;
              return (
                <Pressable
                  key={n}
                  accessibilityRole="button"
                  accessibilityState={{ selected: sel }}
                  onPress={() => set(n)}
                  style={[styles.scaleBox, { width: boxW }, sel && styles.scaleBoxSelected]}>
                  <AppText
                    variant="body"
                    style={
                      {
                        fontFamily: font.mono,
                        fontSize: 14,
                        textDecorationLine: sel ? 'underline' : 'none',
                      } as never
                    }>
                    {n}
                  </AppText>
                </Pressable>
              );
              });
            })()}
          </Anchored>
          <Anchored y={459} style={styles.endpointRow}>
            <AppText variant="caption" muted style={{ marginTop: 8 }}>
              {q.minLabel}
            </AppText>
            <AppText variant="caption" muted style={styles.endpointRight}>
              {q.maxLabel}
            </AppText>
          </Anchored>
        </>
      )}
      {q.kind === 'multi' && (
        <Anchored y={341}>
          {(q.options ?? []).map((opt) => {
            const cur = Array.isArray(value) ? value : [];
            const sel = cur.includes(opt);
            return (
              <Pressable
                key={opt}
                accessibilityRole="button"
                accessibilityState={{ selected: sel }}
                onPress={() => set(sel ? cur.filter((x) => x !== opt) : [...cur, opt])}
                style={({ pressed }) => [
                  styles.optionRow,
                  { paddingVertical: ax(9) },
                  pressed && { opacity: 0.6 },
                ]}>
                <AppText
                  variant="body"
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
        </Anchored>
      )}
      {q.kind === 'text' && (
        <Anchored y={341}>
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
        </Anchored>
      )}
      <AnchoredBottom up={anchorBottom.flowLink}>
        <TextLink
          label={step + 1 < questions.length ? 'Next question' : completeLabel}
          onPress={next}
          disabled={!answered}
          center
          testID="question-next"
        />
      </AnchoredBottom>
    </Stage>
  );
}

const styles = StyleSheet.create({
  // O8: five 39x48 boxes spread across the full 342 measure, not a centred
  // cluster — the gaps are what make the row read as a scale.
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  scaleBox: {
    height: 48,
    borderWidth: 1,
    borderColor: color.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Selection is the underlined numeral (O8) — the box itself stays quiet. */
  scaleBoxSelected: { borderColor: color.muted },
  endpointRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  endpointRight: { textAlign: 'right', maxWidth: 90 },
  optionRow: {
    paddingVertical: 9,
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
