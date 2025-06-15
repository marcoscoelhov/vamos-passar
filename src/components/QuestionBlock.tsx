
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

  const getOptionLabel = (index: number) => {
    return String.fromCharCode(65 + index);
  };

  return (
    <div className="card-medium p-8 max-w-4xl">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-gray-900 text-white rounded-lg px-4 py-2 font-ui font-medium">
            Questão {questionNumber}
          </div>
          <Badge className={`${getDifficultyColor(question.difficulty)} border font-ui`}>
            {getDifficultyLabel(question.difficulty)}
          </Badge>
        </div>
      </div>

      <div className="mb-10">
        <p className="text-xl text-gray-900 leading-relaxed font-reading">
          {question.question}
        </p>
      </div>

      <div className="space-y-4 mb-10">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(index)}
            disabled={showResult}
            className={cn(
              "w-full p-6 text-left rounded-xl border-2 transition-all duration-200",
              "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
              "disabled:cursor-default",
              selectedAnswer === index && !showResult && "bg-green-50 border-green-300",
              showResult && selectedAnswer === index && isCorrect && "bg-green-50 border-green-300",
              showResult && selectedAnswer === index && !isCorrect && "bg-red-50 border-red-300",
              showResult && index === question.correctAnswer && "bg-green-50 border-green-300",
              showResult && index !== question.correctAnswer && index !== selectedAnswer && "bg-gray-50 border-gray-200"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 font-medium font-ui",
                  selectedAnswer === index && !showResult && "bg-green-600 text-white border-green-600",
                  showResult && index === question.correctAnswer && "bg-green-600 text-white border-green-600",
                  showResult && selectedAnswer === index && !isCorrect && "bg-red-600 text-white border-red-600",
                  !showResult && selectedAnswer !== index && "border-gray-300 text-gray-600 bg-white",
                  showResult && index !== question.correctAnswer && index !== selectedAnswer && "border-gray-200 text-gray-400 bg-gray-50"
                )}>
                  {getOptionLabel(index)}
                </div>
                <span className="text-lg text-gray-900 leading-relaxed font-reading">
                  {option}
                </span>
              </div>
              
              {showResult && (
                <div className="flex items-center">
                  {index === question.correctAnswer && (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  )}
                  {selectedAnswer === index && selectedAnswer !== question.correctAnswer && (
                    <XCircle className="w-6 h-6 text-red-600" />
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
          className="w-full py-4 text-lg font-medium btn-medium-primary font-ui"
          size="lg"
        >
          Confirmar Resposta
        </Button>
      ) : (
        <div className="space-y-8">
          <div className={cn(
            "p-6 rounded-xl flex items-center gap-4 border-2",
            isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          )}>
            {isCorrect ? (
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            ) : (
              <XCircle className="w-7 h-7 text-red-600" />
            )}
            <span className={cn(
              "font-medium text-lg font-ui",
              isCorrect ? "text-green-800" : "text-red-800"
            )}>
              {isCorrect ? 'Parabéns! Resposta correta!' : 'Resposta incorreta. Continue estudando!'}
            </span>
          </div>

          {question.explanation && (
            <div className="p-8 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 rounded-lg p-3 mt-1">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-4 text-lg font-ui">Explicação:</h4>
                  <p className="text-blue-800 leading-relaxed text-lg font-reading">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full py-4 font-medium flex items-center gap-3 btn-medium-secondary font-ui text-lg"
            size="lg"
          >
            <RotateCcw className="w-5 h-5" />
            Tentar Novamente
          </Button>
        </div>
      )}
    </div>
  );
}
