
import React, { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { Topic } from '@/types/course';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { logger } from '@/utils/logger';

// Lazy load QuestionBlock
const QuestionBlock = React.lazy(() => 
  import('@/components/QuestionBlock').then(module => {
    logger.debug('QuestionBlock component loaded');
    return { default: module.QuestionBlock };
  }).catch(error => {
    logger.error('Error loading QuestionBlock component', error);
    throw error;
  })
);

interface QuestionsSectionProps {
  currentTopic: Topic;
  isLoadingQuestions: boolean;
}

export const QuestionsSection = React.memo(function QuestionsSection({
  currentTopic,
  isLoadingQuestions
}: QuestionsSectionProps) {
  const hasQuestions = currentTopic.questions && currentTopic.questions.length > 0;

  if (isLoadingQuestions) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Carregando questões...
        </h2>
        <LoadingSkeleton variant="card" className="w-full h-48" />
      </div>
    );
  }

  if (!hasQuestions) {
    return null;
  }

  return (
    <div id="questions-section" className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Questões de Fixação
        </h2>
        <Badge variant="outline" className="text-sm">
          {currentTopic.questions!.length} questão(ões)
        </Badge>
      </div>
      
      <Suspense fallback={
        <div className="space-y-4">
          {Array.from({ length: currentTopic.questions!.length }).map((_, index) => (
            <LoadingSkeleton key={index} variant="card" className="w-full h-32" />
          ))}
        </div>
      }>
        {currentTopic.questions!.map((question, index) => (
          <QuestionBlock
            key={question.id}
            question={question}
            questionNumber={index + 1}
          />
        ))}
      </Suspense>
    </div>
  );
});
