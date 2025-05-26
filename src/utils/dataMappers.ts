
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
    parentTopicId: dbTopic.parent_topic_id || undefined,
    level: dbTopic.level,
    questions,
    completed,
    children: [],
  };
};

export const buildTopicHierarchy = (topics: Topic[]): Topic[] => {
  const topicMap = new Map<string, Topic>();
  const rootTopics: Topic[] = [];

  // Create a map of all topics
  topics.forEach(topic => {
    topicMap.set(topic.id, { ...topic, children: [] });
  });

  // Build the hierarchy
  topics.forEach(topic => {
    const mappedTopic = topicMap.get(topic.id)!;
    
    if (topic.parentTopicId) {
      const parent = topicMap.get(topic.parentTopicId);
      if (parent) {
        parent.children!.push(mappedTopic);
      }
    } else {
      rootTopics.push(mappedTopic);
    }
  });

  // Sort children by order
  const sortChildren = (topics: Topic[]) => {
    topics.sort((a, b) => a.order - b.order);
    topics.forEach(topic => {
      if (topic.children && topic.children.length > 0) {
        sortChildren(topic.children);
      }
    });
  };

  sortChildren(rootTopics);
  
  return rootTopics;
};

export const flattenTopicHierarchy = (topics: Topic[]): Topic[] => {
  const flattened: Topic[] = [];
  
  const addTopicsRecursively = (topicList: Topic[]) => {
    topicList.forEach(topic => {
      flattened.push(topic);
      if (topic.children && topic.children.length > 0) {
        addTopicsRecursively(topic.children);
      }
    });
  };
  
  addTopicsRecursively(topics);
  return flattened;
};
