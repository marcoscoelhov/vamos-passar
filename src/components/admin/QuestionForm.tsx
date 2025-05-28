import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useQuestions } from '@/hooks/useQuestions';
import { Topic } from '@/types/course';
import { logger } from '@/utils/logger';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopicId || !question.trim() || correctAnswer === null || 
        options.some(opt => !opt.trim()) || !explanation.trim()) {
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmAddQuestion = async () => {
    if (!selectedTopicId || !question.trim() || correctAnswer === null || 
        options.some(opt => !opt.trim()) || !explanation.trim()) {
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

  const updateOption = (index: number, value: string) => {
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
      
      // Adjust correct answer if necessary
      if (correctAnswer !== null) {
        if (correctAnswer === index) {
          setCorrectAnswer(null);
        } else if (correctAnswer > index) {
          setCorrectAnswer(correctAnswer - 1);
        }
      }
    }
  };

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

  if (!isAdmin) {
    return (
      <Card className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
        <p className="text-gray-600">
          Apenas administradores podem adicionar novas questões.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
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
            <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
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
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Opções de Resposta
            </label>
            {options.length < 6 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Opção
              </Button>
            )}
          </div>
          
          <RadioGroup
            value={correctAnswer?.toString()}
            onValueChange={(value) => setCorrectAnswer(parseInt(value))}
          >
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Opção ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                    required
                  />
                  <Label htmlFor={`option-${index}`} className="text-xs text-gray-500 min-w-[60px]">
                    {correctAnswer === index ? 'Correta' : `Opção ${String.fromCharCode(65 + index)}`}
                  </Label>
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </RadioGroup>
          <p className="text-xs text-gray-500 mt-2">
            Selecione o botão de rádio ao lado da resposta correta
          </p>
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

        <Button
          type="submit"
          disabled={
            isLoading || 
            !selectedTopicId || 
            !question.trim() || 
            correctAnswer === null || 
            options.some(opt => !opt.trim()) || 
            !explanation.trim()
          }
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adicionando...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Questão
            </>
          )}
        </Button>
      </form>

      {/* Diálogo de confirmação */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar adição de questão</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p className="mb-4">Você está prestes a adicionar uma nova questão. Revise os dados:</p>
                
                <div className="space-y-3 p-4 bg-gray-50 rounded max-h-60 overflow-y-auto">
                  <div>
                    <p className="text-sm font-medium">Pergunta:</p>
                    <p className="text-sm">{question}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Opções:</p>
                    <ul className="text-sm space-y-1">
                      {options.map((option, index) => (
                        <li key={index} className={correctAnswer === index ? 'font-bold text-green-600' : ''}>
                          {String.fromCharCode(65 + index)}) {option}
                          {correctAnswer === index && ' ✓'}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Explicação:</p>
                    <p className="text-sm">{explanation}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Dificuldade:</p>
                    <p className="text-sm">{difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Médio' : 'Difícil'}</p>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAddQuestion} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : (
                'Confirmar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
