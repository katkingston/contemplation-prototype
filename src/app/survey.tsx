/** S3 — Series Completion Survey: mirrors the intake instrument to measure change. */
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { QuestionFlow } from '@/components/QuestionFlow';
import { surveyQuestions } from '@/content/copy';
import { useApp } from '@/services/provider';

export default function Survey() {
  const { act } = useApp();
  const params = useLocalSearchParams<{ seriesId?: string }>();
  const seriesId = params.seriesId ?? '';
  return (
    <QuestionFlow
      questions={surveyQuestions}
      completeLabel="Complete"
      onComplete={async (answers) => {
        if (await act((s) => s.saveSurvey(seriesId, answers)))
          router.replace({ pathname: '/next-step', params: { seriesId } });
      }}
    />
  );
}
