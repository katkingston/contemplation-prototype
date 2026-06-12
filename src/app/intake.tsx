/** O8 — Intake Questionnaire: baseline, one question per slide, all required. */
import { router } from 'expo-router';
import React from 'react';
import { QuestionFlow } from '@/components/QuestionFlow';
import { intakeQuestions } from '@/content/copy';
import { useApp } from '@/services/provider';

export default function Intake() {
  const { act } = useApp();
  return (
    <QuestionFlow
      questions={intakeQuestions}
      completeLabel="Complete"
      onComplete={async (answers) => {
        await act((s) => s.saveIntake(answers));
        router.replace('/home');
      }}
    />
  );
}
