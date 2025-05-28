
import React from 'react';
import { Topic } from '@/types/course';
import { QuestionBlock } from './QuestionBlock';

interface QuestionsSectionProps {
  topic: Topic;
  isLoadingQuestions: boolean;
}

export function QuestionsSection({ topic, isLoadingQuestions }: QuestionsSectionProps) {
  if (isLoadingQuestions) {
    return (
      <div className="pt-16 border-t border-gray-100">
        <div className="text-center text-gray-500 mb-8">
          Carregando questões...
        </div>
      </div>
    );
  }

  if (!topic.questions || topic.questions.length === 0) {
    return null;
  }

  return (
    <section id="questions-section" className="pt-16 border-t border-gray-100">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl font-semibold text-gray-900 mb-3">
          Questões de Fixação
        </h2>
        <p className="text-gray-500 text-sm">
          {topic.questions.length} questão{topic.questions.length > 1 ? 'ões' : ''}
        </p>
      </div>
      
      <div className="space-y-8">
        {topic.questions.map((question, index) => (
          <QuestionBlock
            key={question.id}
            question={question}
            questionNumber={index + 1}
          />
        ))}
      </div>
    </section>
  );
}
