
import { Question, Topic, DbQuestion, DbTopic } from '@/types/course';

export const mapDbQuestionToQuestion = (dbQuestion: DbQuestion): Question => {
  return {
    id: dbQuestion.id,
    question: dbQuestion.question,
    options: Array.isArray(dbQuestion.options) ? dbQuestion.options : JSON.parse(dbQuestion.options as string),
    correctAnswer: dbQuestion.correct_answer,
    explanation: dbQuestion.explanation,
    type: 'multiple-choice' as const,
    difficulty: dbQuestion.difficulty,
  };
};

export const mapDbTopicToTopic = (dbTopic: DbTopic, questions: Question[] = [], completed: boolean = false): Topic => {
  return {
    id: dbTopic.id,
    title: dbTopic.title,
    content: dbTopic.content,
    order: dbTopic.order_index,
    questions,
    completed,
  };
};
