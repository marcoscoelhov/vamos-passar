
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { Question } from '@/types/course';
import { cn } from '@/lib/utils';

interface QuestionBlockProps {
  question: Question;
  questionNumber: number;
}

export function QuestionBlock({ question, questionNumber }: QuestionBlockProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerSelect = (optionIndex: number) => {
    if (!showResult) {
      setSelectedAnswer(optionIndex);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const isCorrect = selectedAnswer === question.correctAnswer;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return difficulty;
    }
  };

  return (
    <Card className="p-6 bg-white border border-gray-200 animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Questão {questionNumber}
        </h3>
        <Badge className={getDifficultyColor(question.difficulty)}>
          {getDifficultyLabel(question.difficulty)}
        </Badge>
      </div>

      <p className="text-gray-800 mb-6 leading-relaxed">
        {question.question}
      </p>

      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(index)}
            disabled={showResult}
            className={cn(
              "w-full p-4 text-left rounded-lg border transition-all",
              "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
              selectedAnswer === index && !showResult && "bg-blue-50 border-blue-300",
              showResult && selectedAnswer === index && isCorrect && "bg-green-50 border-green-300",
              showResult && selectedAnswer === index && !isCorrect && "bg-red-50 border-red-300",
              showResult && index === question.correctAnswer && "bg-green-50 border-green-300"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-800">
                <span className="font-medium mr-3">
                  {String.fromCharCode(65 + index)})
                </span>
                {option}
              </span>
              
              {showResult && (
                <div className="flex items-center">
                  {index === question.correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  {selectedAnswer === index && selectedAnswer !== question.correctAnswer && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {!showResult ? (
        <Button
          onClick={handleSubmit}
          disabled={selectedAnswer === null}
          className="w-full"
        >
          Confirmar Resposta
        </Button>
      ) : (
        <div className="space-y-4">
          <div className={cn(
            "p-4 rounded-lg flex items-center gap-3",
            isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          )}>
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={cn(
              "font-medium",
              isCorrect ? "text-green-800" : "text-red-800"
            )}>
              {isCorrect ? 'Resposta correta!' : 'Resposta incorreta!'}
            </span>
          </div>

          {question.explanation && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Explicação:</h4>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full"
          >
            Tentar Novamente
          </Button>
        </div>
      )}
    </Card>
  );
}
