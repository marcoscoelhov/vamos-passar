
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface QuestionOptionsManagerProps {
  options: string[];
  setOptions: (options: string[]) => void;
  correctAnswer: number | null;
  setCorrectAnswer: (value: number | null) => void;
}

export function QuestionOptionsManager({
  options,
  setOptions,
  correctAnswer,
  setCorrectAnswer
}: QuestionOptionsManagerProps) {
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

  return (
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
  );
}
