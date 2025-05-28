
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Info, RotateCcw } from 'lucide-react';
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
      case 'easy': return 'bg-green-50 text-green-700 border-green-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'hard': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
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

  // Gera letras para as alternativas baseado na quantidade de opções
  const getOptionLabel = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D, E, F...
  };

  return (
    <Card className="p-8 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-gray-900 text-white rounded-lg px-3 py-1.5 text-sm font-medium">
            Questão {questionNumber}
          </div>
          <Badge className={`${getDifficultyColor(question.difficulty)} border text-xs font-medium`}>
            {getDifficultyLabel(question.difficulty)}
          </Badge>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-gray-800 leading-relaxed text-lg font-serif">
          {question.question}
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(index)}
            disabled={showResult}
            className={cn(
              "w-full p-5 text-left rounded-lg border transition-all duration-200",
              "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2",
              "disabled:cursor-default",
              selectedAnswer === index && !showResult && "bg-blue-50 border-blue-200",
              showResult && selectedAnswer === index && isCorrect && "bg-green-50 border-green-200",
              showResult && selectedAnswer === index && !isCorrect && "bg-red-50 border-red-200",
              showResult && index === question.correctAnswer && "bg-green-50 border-green-200",
              showResult && index !== question.correctAnswer && index !== selectedAnswer && "bg-gray-50 border-gray-100"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border font-medium text-sm",
                  selectedAnswer === index && !showResult && "bg-blue-600 text-white border-blue-600",
                  showResult && index === question.correctAnswer && "bg-green-600 text-white border-green-600",
                  showResult && selectedAnswer === index && !isCorrect && "bg-red-600 text-white border-red-600",
                  !showResult && selectedAnswer !== index && "border-gray-300 text-gray-600 bg-white",
                  showResult && index !== question.correctAnswer && index !== selectedAnswer && "border-gray-200 text-gray-400 bg-gray-50"
                )}>
                  {getOptionLabel(index)}
                </div>
                <span className="text-gray-800 leading-relaxed font-serif">
                  {option}
                </span>
              </div>
              
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
          className="w-full py-3 text-base font-medium bg-gray-900 hover:bg-gray-800"
          size="lg"
        >
          Confirmar Resposta
        </Button>
      ) : (
        <div className="space-y-6">
          <div className={cn(
            "p-5 rounded-lg flex items-center gap-4 border",
            isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          )}>
            {isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <span className={cn(
              "font-medium",
              isCorrect ? "text-green-800" : "text-red-800"
            )}>
              {isCorrect ? 'Parabéns! Resposta correta!' : 'Resposta incorreta. Continue estudando!'}
            </span>
          </div>

          {question.explanation && (
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 rounded-lg p-2 mt-1">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-3">Explicação:</h4>
                  <p className="text-blue-800 leading-relaxed font-serif">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full py-3 font-medium flex items-center gap-2 border-gray-200 hover:bg-gray-50"
            size="lg"
          >
            <RotateCcw className="w-4 h-4" />
            Tentar Novamente
          </Button>
        </div>
      )}
    </Card>
  );
}
