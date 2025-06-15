
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HelpCircle, Plus, X, Check, AlertCircle } from 'lucide-react';
import { Question } from '@/types/course';

interface InlineQuestionEditorProps {
  onInsert: (question: Omit<Question, 'id'>) => void;
  onCancel: () => void;
  position?: number;
}

export function InlineQuestionEditor({ onInsert, onCancel, position }: InlineQuestionEditorProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

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
      if (correctAnswer === index) {
        setCorrectAnswer(null);
      } else if (correctAnswer !== null && correctAnswer > index) {
        setCorrectAnswer(correctAnswer - 1);
      }
    }
  };

  const isValid = question.trim() && 
                 options.filter(opt => opt.trim()).length >= 2 && 
                 correctAnswer !== null && 
                 options[correctAnswer].trim();

  const handleSave = () => {
    if (!isValid) return;

    const questionData: Omit<Question, 'id'> = {
      question: question.trim(),
      options: options.filter(opt => opt.trim()),
      correctAnswer: correctAnswer!,
      explanation: explanation.trim(),
      difficulty,
    };

    onInsert(questionData);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="p-6 border-2 border-blue-200 bg-blue-50/30 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">
            Nova Questão {position && `(Posição ${position})`}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getDifficultyColor(difficulty)}>
            {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Médio' : 'Difícil'}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {/* Pergunta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pergunta *
          </label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Digite sua pergunta aqui..."
            className="min-h-[80px]"
          />
        </div>

        {/* Dificuldade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nível de Dificuldade
          </label>
          <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Fácil</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="hard">Difícil</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Opções */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opções de Resposta * (mínimo 2)
          </label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => setCorrectAnswer(index)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      correctAnswer === index
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {correctAnswer === index && <Check className="w-3 h-3" />}
                  </button>
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Opção ${index + 1}`}
                    className="flex-1"
                  />
                </div>
                {options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          {options.length < 6 && (
            <Button
              variant="outline"
              size="sm"
              onClick={addOption}
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Opção
            </Button>
          )}
          
          <p className="text-xs text-gray-500 mt-1">
            Clique no círculo para marcar a resposta correta
          </p>
        </div>

        {/* Explicação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explicação (Opcional)
          </label>
          <Textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explique por que esta é a resposta correta..."
            className="min-h-[60px]"
          />
        </div>

        {/* Validação */}
        {!isValid && (
          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded">
            <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-medium mb-1">Complete os campos obrigatórios:</p>
              <ul className="list-disc list-inside space-y-1">
                {!question.trim() && <li>Digite a pergunta</li>}
                {options.filter(opt => opt.trim()).length < 2 && <li>Adicione pelo menos 2 opções</li>}
                {correctAnswer === null && <li>Marque a resposta correta</li>}
              </ul>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isValid}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            Inserir Questão
          </Button>
        </div>
      </div>
    </Card>
  );
}
