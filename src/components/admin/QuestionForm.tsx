
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useQuestions } from '@/hooks/useQuestions';
import { Topic } from '@/types/course';
import { logger } from '@/utils/logger';
import { QuestionFormHeader } from './question-form/QuestionFormHeader';
import { QuestionFormFields } from './question-form/QuestionFormFields';
import { QuestionOptionsManager } from './question-form/QuestionOptionsManager';
import { QuestionFormActions } from './question-form/QuestionFormActions';
import { QuestionConfirmDialog } from './question-form/QuestionConfirmDialog';

interface QuestionFormProps {
  topics: Topic[];
  isAdmin: boolean;
  onQuestionAdded: () => void;
}

export function QuestionForm({ topics, isAdmin, onQuestionAdded }: QuestionFormProps) {
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { addQuestion, isLoading } = useQuestions();

  const isFormValid = selectedTopicId && 
    question.trim() && 
    correctAnswer !== null && 
    !options.some(opt => !opt.trim()) && 
    explanation.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmAddQuestion = async () => {
    if (!isFormValid) {
      return;
    }

    try {
      await addQuestion(
        selectedTopicId,
        {
          question: question.trim(),
          options: options.map(opt => opt.trim()),
          correctAnswer,
          explanation: explanation.trim(),
          difficulty,
          type: 'multiple-choice'
        },
        isAdmin
      );

      // Reset form
      setSelectedTopicId('');
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectAnswer(null);
      setExplanation('');
      setDifficulty('medium');
      setShowConfirmDialog(false);
      onQuestionAdded();
    } catch (error) {
      logger.error('Error in confirmAddQuestion', { selectedTopicId, question, error });
      setShowConfirmDialog(false);
    }
  };

  // Show access denied if not admin
  const headerComponent = <QuestionFormHeader isAdmin={isAdmin} />;
  if (!isAdmin) {
    return headerComponent;
  }

  return (
    <>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <QuestionFormFields
            selectedTopicId={selectedTopicId}
            setSelectedTopicId={setSelectedTopicId}
            question={question}
            setQuestion={setQuestion}
            explanation={explanation}
            setExplanation={setExplanation}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            topics={topics}
          />

          <QuestionOptionsManager
            options={options}
            setOptions={setOptions}
            correctAnswer={correctAnswer}
            setCorrectAnswer={setCorrectAnswer}
          />

          <QuestionFormActions
            isLoading={isLoading}
            isFormValid={!!isFormValid}
          />
        </form>
      </Card>

      <QuestionConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={confirmAddQuestion}
        isLoading={isLoading}
        question={question}
        options={options}
        correctAnswer={correctAnswer}
        explanation={explanation}
        difficulty={difficulty}
      />
    </>
  );
}
