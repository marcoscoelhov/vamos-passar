
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Clock, Users, CheckCircle2 } from 'lucide-react';
import { Topic } from '@/types/course';

interface ModernHeroSectionProps {
  topic: Topic;
  onScrollToQuestions?: () => void;
}

export function ModernHeroSection({ topic, onScrollToQuestions }: ModernHeroSectionProps) {
  // Estimate reading time (average 200 words per minute)
  const wordCount = topic.content.split(' ').length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <section className="relative bg-gradient-to-br from-green-50 via-white to-blue-50 rounded-2xl p-8 lg:p-12 mb-12 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-full blur-3xl opacity-30 -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100 to-green-100 rounded-full blur-2xl opacity-20 translate-y-24 -translate-x-24"></div>
      
      <div className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Topic metadata */}
            <div className="flex flex-wrap items-center gap-3">
              {topic.level > 0 && (
                <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm">
                  Subtópico • Nível {topic.level}
                </Badge>
              )}
              <div className="flex items-center gap-2 text-gray-600 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{readingTime} min de leitura</span>
              </div>
              {topic.completed && (
                <div className="flex items-center gap-2 text-green-700 bg-green-100/80 backdrop-blur-sm px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Concluído</span>
                </div>
              )}
            </div>

            {/* Main title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-display text-gray-900 leading-tight">
              {topic.title}
            </h1>

            {/* Description or excerpt */}
            <p className="text-lg md:text-xl text-gray-700 font-reading leading-relaxed max-w-2xl">
              Aprenda os conceitos fundamentais e práticos para dominar este tópico essencial.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              {onScrollToQuestions && (
                <Button 
                  onClick={onScrollToQuestions}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Ver Exercícios
                </Button>
              )}
              <Button 
                variant="outline" 
                className="border-gray-300 bg-white/80 backdrop-blur-sm hover:bg-white px-6 py-3 rounded-full font-medium transition-all duration-200"
              >
                <Users className="w-4 h-4 mr-2" />
                Discussões
              </Button>
            </div>
          </div>

          {/* Visual Column */}
          <div className="lg:col-span-1">
            <div className="relative">
              {/* Video/Presenter placeholder */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 to-blue-100/50"></div>
                  <Button 
                    variant="ghost" 
                    size="lg"
                    className="relative z-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full w-16 h-16 p-0 shadow-lg"
                  >
                    <Play className="w-6 h-6 text-green-600 ml-1" />
                  </Button>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-1">Vídeo Explicativo</h3>
                  <p className="text-sm text-gray-600">Introdução visual ao tópico</p>
                </div>
              </div>

              {/* Floating stats */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Em Progresso</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
