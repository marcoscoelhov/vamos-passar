
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Topic } from '@/types/course';

interface QuestionFormFieldsProps {
  selectedTopicId: string;
  setSelectedTopicId: (value: string) => void;
  question: string;
  setQuestion: (value: string) => void;
  explanation: string;
  setExplanation: (value: string) => void;
  difficulty: 'easy' | 'medium' | 'hard';
  setDifficulty: (value: 'easy' | 'medium' | 'hard') => void;
  topics: Topic[];
}

export function QuestionFormFields({
  selectedTopicId,
  setSelectedTopicId,
  question,
  setQuestion,
  explanation,
  setExplanation,
  difficulty,
  setDifficulty,
  topics
}: QuestionFormFieldsProps) {
  const getAllTopics = (topicList: Topic[]): Topic[] => {
    const allTopics: Topic[] = [];
    
    const addTopic = (topic: Topic) => {
      allTopics.push(topic);
      if (topic.children) {
        topic.children.forEach(addTopic);
      }
    };
    
    topicList.forEach(addTopic);
    return allTopics;
  };

  const allTopics = getAllTopics(topics);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            Tópico
          </label>
          <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um tópico" />
            </SelectTrigger>
            <SelectContent>
              {allTopics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
            Dificuldade
          </label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Fácil</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="hard">Difícil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
          Pergunta
        </label>
        <Textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Digite a pergunta..."
          rows={3}
          required
        />
      </div>

      <div>
        <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-1">
          Explicação
        </label>
        <Textarea
          id="explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explicação da resposta correta..."
          rows={3}
          required
        />
      </div>
    </>
  );
}
