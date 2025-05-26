
import { Question, Topic, DbQuestion, DbTopic } from '@/types/course';

export const mapDbQuestionToQuestion = (dbQuestion: DbQuestion): Question => {
  // Ensure difficulty is one of the allowed values, default to 'medium' if invalid
  const validDifficulty = ['easy', 'medium', 'hard'].includes(dbQuestion.difficulty || '') 
    ? (dbQuestion.difficulty as 'easy' | 'medium' | 'hard')
    : 'medium';

  return {
    id: dbQuestion.id,
    question: dbQuestion.question,
    options: Array.isArray(dbQuestion.options) ? dbQuestion.options : JSON.parse(dbQuestion.options as string),
    correctAnswer: dbQuestion.correct_answer,
    explanation: dbQuestion.explanation,
    type: 'multiple-choice' as const,
    difficulty: validDifficulty,
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
