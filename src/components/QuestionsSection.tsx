
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
      <div className="pt-20 border-t border-gray-100">
        <div className="text-center text-gray-500 mb-12 font-ui">
          Carregando questões...
        </div>
      </div>
    );
  }

  if (!topic.questions || topic.questions.length === 0) {
    return null;
  }

  return (
    <section id="questions-section" className="pt-20 border-t border-gray-100">
      <div className="text-center mb-16">
        <h2 className="medium-heading mb-4">
          Questões de Fixação
        </h2>
        <p className="medium-caption">
          {topic.questions.length} questão{topic.questions.length > 1 ? 'ões' : ''} • 
          Teste seus conhecimentos sobre o conteúdo estudado
        </p>
      </div>
      
      <div className="space-y-12">
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
