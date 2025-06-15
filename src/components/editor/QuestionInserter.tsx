
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Plus, X, Save } from 'lucide-react';
import { Question } from '@/types/course';

interface QuestionInserterProps {
  onInsert: (question: Omit<Question, 'id'>) => void;
  onCancel: () => void;
}

export function QuestionInserter({ onInsert, onCancel }: QuestionInserterProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
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
      if (correctAnswer >= index && correctAnswer > 0) {
        setCorrectAnswer(correctAnswer - 1);
      }
    }
  };

  const handleSubmit = () => {
    if (!question.trim() || options.filter(opt => opt.trim()).length < 2) {
      return;
    }

    const questionData: Omit<Question, 'id'> = {
      question: question.trim(),
      options: options.filter(opt => opt.trim()),
      correctAnswer,
      explanation: explanation.trim(),
      difficulty,
      type: 'multiple-choice'
    };

    onInsert(questionData);
  };

  const isValid = question.trim() && options.filter(opt => opt.trim()).length >= 2;

  return (
    <Card className="absolute z-50 w-[500px] p-6 shadow-xl border-2 border-blue-200 bg-white mt-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Inserir Questão</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Pergunta *</label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Digite a pergunta..."
            className="min-h-[60px] resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Opções de Resposta *</label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge 
                  variant={correctAnswer === index ? "default" : "outline"}
                  className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer text-xs"
                  onClick={() => setCorrectAnswer(index)}
                >
                  {String.fromCharCode(65 + index)}
                </Badge>
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Opção ${String.fromCharCode(65 + index)}`}
                  className="flex-1"
                />
                {options.length > 2 && (
                  <Button variant="ghost" size="sm" onClick={() => removeOption(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          {options.length < 6 && (
            <Button variant="outline" size="sm" onClick={addOption} className="mt-2">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Opção
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Dificuldade</label>
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
          <label className="block text-sm font-medium mb-1">Explicação (opcional)</label>
          <Textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explique por que esta é a resposta correta..."
            className="min-h-[50px] resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-1" />
            Inserir Questão
          </Button>
        </div>
      </div>
    </Card>
  );
}
