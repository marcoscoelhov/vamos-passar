
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Plus, X, Save } from 'lucide-react';
import { Question } from '@/types/course';

interface InlineQuestionEditorProps {
  onInsert: (question: Omit<Question, 'id'>) => void;
  onCancel: () => void;
  position: number;
}

export function InlineQuestionEditor({ onInsert, onCancel, position }: InlineQuestionEditorProps) {
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
    setOptions([...options, '']);
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
    <Card className="p-6 border-2 border-blue-200 bg-blue-50/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">
            Inserir Questão na Posição {position}
          </h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="question">Pergunta *</Label>
          <Textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Digite a pergunta..."
            className="min-h-[80px]"
          />
        </div>

        <div>
          <Label>Opções de Resposta *</Label>
          <div className="space-y-2 mt-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <Badge 
                    variant={correctAnswer === index ? "default" : "outline"}
                    className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                    onClick={() => setCorrectAnswer(index)}
                  >
                    {String.fromCharCode(65 + index)}
                  </Badge>
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Opção ${String.fromCharCode(65 + index)}`}
                  />
                </div>
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
          
          <p className="text-sm text-gray-600 mt-1">
            Clique na letra para marcar a resposta correta
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Dificuldade</Label>
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
          <Label htmlFor="explanation">Explicação (opcional)</Label>
          <Textarea
            id="explanation"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explique por que esta é a resposta correta..."
            className="min-h-[60px]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            <Save className="w-4 h-4 mr-1" />
            Inserir Questão
          </Button>
        </div>
      </div>
    </Card>
  );
}
