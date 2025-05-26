
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus } from 'lucide-react';
import { Topic } from '@/types/course';
import { useQuestions } from '@/hooks/useQuestions';

interface QuestionFormProps {
  topics: Topic[];
  isAdmin: boolean;
  onQuestionAdded: () => void;
}

export function QuestionForm({ topics, isAdmin, onQuestionAdded }: QuestionFormProps) {
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  
  const { addQuestion, isLoading } = useQuestions();

  const handleSubmit = async () => {
    if (!selectedTopicId || !questionText || options.some(opt => !opt.trim()) || !explanation) {
      return;
    }

    try {
      await addQuestion(
        selectedTopicId,
        {
          question: questionText,
          options: options.filter(opt => opt.trim()),
          correctAnswer: correctAnswer,
          explanation: explanation,
          difficulty: difficulty,
          type: 'multiple-choice' as const,
        },
        isAdmin
      );

      // Reset form
      setSelectedTopicId('');
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCorrectAnswer(0);
      setExplanation('');
      setDifficulty('medium');
      
      onQuestionAdded();
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      
      if (correctAnswer >= newOptions.length) {
        setCorrectAnswer(newOptions.length - 1);
      }
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Adicionar Nova Questão</h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="topic-select">Tópico</Label>
          <Select value={selectedTopicId} onValueChange={setSelectedTopicId} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um tópico" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="question-text">Enunciado da Questão</Label>
          <Textarea
            id="question-text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Digite o enunciado da questão..."
            rows={3}
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Alternativas</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              disabled={options.length >= 6 || isLoading}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant={index === correctAnswer ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCorrectAnswer(index)}
                  disabled={isLoading}
                >
                  ✓
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2 || isLoading}
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="difficulty">Dificuldade</Label>
          <Select 
            value={difficulty} 
            onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}
            disabled={isLoading}
          >
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

        <div>
          <Label htmlFor="explanation">Explicação</Label>
          <Textarea
            id="explanation"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Digite a explicação da questão..."
            rows={3}
            disabled={isLoading}
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={
            isLoading ||
            !selectedTopicId ||
            !questionText ||
            options.some(opt => !opt.trim()) ||
            !explanation
          }
        >
          {isLoading ? 'Adicionando...' : 'Adicionar Questão'}
        </Button>
      </div>
    </Card>
  );
}
