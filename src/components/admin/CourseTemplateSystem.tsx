
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Users, Clock, Star, Download, Eye, Copy } from 'lucide-react';

interface CourseTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  topicsCount: number;
  questionsCount: number;
  rating: number;
  downloads: number;
  preview: {
    topics: string[];
    sampleContent: string;
  };
}

const courseTemplates: CourseTemplate[] = [
  {
    id: 'intro-programming',
    title: 'Introdução à Programação',
    description: 'Curso completo para iniciantes em programação com exemplos práticos',
    category: 'Tecnologia',
    difficulty: 'beginner',
    estimatedHours: 20,
    topicsCount: 15,
    questionsCount: 45,
    rating: 4.8,
    downloads: 234,
    preview: {
      topics: [
        'O que é programação?',
        'Lógica de programação',
        'Variáveis e tipos de dados',
        'Estruturas condicionais',
        'Loops e repetições'
      ],
      sampleContent: 'Programação é o processo de criar um conjunto de instruções que dizem ao computador como executar uma tarefa...'
    }
  },
  {
    id: 'marketing-digital',
    title: 'Marketing Digital Básico',
    description: 'Fundamentos do marketing digital para pequenas empresas',
    category: 'Marketing',
    difficulty: 'beginner',
    estimatedHours: 12,
    topicsCount: 10,
    questionsCount: 30,
    rating: 4.6,
    downloads: 456,
    preview: {
      topics: [
        'Introdução ao Marketing Digital',
        'Redes Sociais para Empresas',
        'SEO Básico',
        'Email Marketing',
        'Métricas e Analytics'
      ],
      sampleContent: 'O marketing digital é uma estratégia que utiliza canais digitais para promover produtos e serviços...'
    }
  },
  {
    id: 'project-management',
    title: 'Gestão de Projetos',
    description: 'Metodologias e ferramentas para gestão eficaz de projetos',
    category: 'Gestão',
    difficulty: 'intermediate',
    estimatedHours: 25,
    topicsCount: 18,
    questionsCount: 54,
    rating: 4.9,
    downloads: 189,
    preview: {
      topics: [
        'Fundamentos da Gestão de Projetos',
        'Metodologias Ágeis',
        'Scrum Framework',
        'Ferramentas de Gestão',
        'Comunicação em Projetos'
      ],
      sampleContent: 'A gestão de projetos é a aplicação de conhecimentos, habilidades, ferramentas e técnicas...'
    }
  }
];

export function CourseTemplateSystem() {
  const [selectedTemplate, setSelectedTemplate] = useState<CourseTemplate | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return difficulty;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Templates de Curso</h1>
        <p className="text-purple-100">Acelere a criação dos seus cursos com templates pré-configurados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courseTemplates.map(template => (
          <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{template.category}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{template.rating}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold">{template.title}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 py-3 border-t border-b">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Duração</p>
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold">{template.estimatedHours}h</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">Tópicos</p>
                  <div className="flex items-center justify-center gap-1">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">{template.topicsCount}</span>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={getDifficultyColor(template.difficulty)}>
                  {getDifficultyLabel(template.difficulty)}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {template.downloads}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{template.title}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Tópicos inclusos:</h4>
                        <ul className="space-y-1">
                          {template.preview.topics.map((topic, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">
                                {index + 1}
                              </span>
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Exemplo de conteúdo:</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-700">{template.preview.sampleContent}</p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button size="sm" className="flex-1">
                  <Copy className="w-4 h-4 mr-1" />
                  Usar Template
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* CTA para templates customizados */}
      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Precisa de um template específico?</h3>
        <p className="text-gray-600 mb-4">
          Nossa equipe pode criar templates personalizados para sua área de conhecimento
        </p>
        <Button variant="outline">
          Solicitar Template Customizado
        </Button>
      </Card>
    </div>
  );
}
