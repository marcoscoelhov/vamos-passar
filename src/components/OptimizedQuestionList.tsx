
import React, { useCallback, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary';
import { OptimizedLoadingSkeleton } from '@/components/OptimizedLoadingSkeleton';
import { OptimizedEmptyState } from '@/components/OptimizedEmptyState';
import { Question } from '@/types/course';
import { HelpCircle } from 'lucide-react';
import { logger } from '@/utils/logger';

interface OptimizedQuestionListProps {
  questions: Question[] | null;
  isLoading: boolean;
  onAddQuestion?: () => void;
  renderQuestion: (question: Question, index: number) => JSX.Element;
}

export const OptimizedQuestionList = React.memo(function OptimizedQuestionList({
  questions,
  isLoading,
  onAddQuestion,
  renderQuestion
}: OptimizedQuestionListProps) {
  const hasQuestions = useMemo(() => 
    questions && questions.length > 0, 
    [questions]
  );

  const questionsByDifficulty = useMemo(() => {
    if (!questions) return {};
    
    return questions.reduce((acc, question) => {
      const difficulty = question.difficulty || 'medium';
      if (!acc[difficulty]) acc[difficulty] = 0;
      acc[difficulty]++;
      return acc;
    }, {} as Record<string, number>);
  }, [questions]);

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <OptimizedLoadingSkeleton variant="text" lines={1} className="w-40" />
          <OptimizedLoadingSkeleton variant="button" className="w-20" />
        </div>
        <OptimizedLoadingSkeleton variant="list" count={3} />
      </div>
    );
  }

  if (!hasQuestions) {
    return (
      <OptimizedEmptyState
        title="Nenhuma questão encontrada"
        description="Este tópico não possui questões de fixação"
        icon={<HelpCircle className="w-12 h-12" />}
        action={onAddQuestion ? {
          label: "Adicionar questão",
          onClick: onAddQuestion
        } : undefined}
      />
    );
  }

  return (
    <SectionErrorBoundary sectionName="Lista de questões">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold">Questões de Fixação</h3>
            <Badge variant="outline">
              {questions!.length} questão(ões)
            </Badge>
          </div>
          
          <div className="flex gap-2">
            {Object.entries(questionsByDifficulty).map(([difficulty, count]) => (
              <Badge key={difficulty} className={difficultyColors[difficulty as keyof typeof difficultyColors]}>
                {difficulty}: {count}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          {questions!.map((question, index) => (
            <SectionErrorBoundary 
              key={question.id} 
              sectionName={`Questão ${index + 1}`}
            >
              {renderQuestion(question, index)}
            </SectionErrorBoundary>
          ))}
        </div>
      </div>
    </SectionErrorBoundary>
  );
});
