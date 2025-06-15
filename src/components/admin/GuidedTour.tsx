
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, ArrowRight, ArrowLeft, X, CheckCircle, Lightbulb, Target } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  action?: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  tip?: string;
}

interface Tour {
  id: string;
  title: string;
  description: string;
  category: 'getting-started' | 'content' | 'users' | 'advanced';
  estimatedTime: string;
  steps: TourStep[];
}

const tours: Tour[] = [
  {
    id: 'first-steps',
    title: 'Primeiros Passos',
    description: 'Aprenda a navegar pelo painel e criar seu primeiro conteúdo',
    category: 'getting-started',
    estimatedTime: '5 min',
    steps: [
      {
        id: 'welcome',
        title: 'Bem-vindo ao Painel!',
        description: 'Este é seu painel administrativo. Aqui você pode gerenciar todo o conteúdo do seu curso.',
        target: '.admin-header',
        position: 'bottom'
      },
      {
        id: 'sidebar',
        title: 'Menu de Navegação',
        description: 'Use este menu para navegar entre as diferentes seções: conteúdo, usuários, relatórios e mais.',
        target: '.admin-sidebar',
        position: 'right'
      },
      {
        id: 'content-section',
        title: 'Gestão de Conteúdo',
        description: 'Aqui você pode criar novos tópicos, importar documentos e organizar seu curso.',
        target: '[data-section="content"]',
        position: 'top',
        action: 'Clique em "Conteúdo" no menu lateral'
      },
      {
        id: 'create-topic',
        title: 'Criando Conteúdo',
        description: 'Use este botão para criar um novo tópico ou importar um documento.',
        target: '.create-content-button',
        position: 'bottom',
        tip: 'Dica: Você pode arrastar e soltar arquivos PDF diretamente!'
      }
    ]
  },
  {
    id: 'content-management',
    title: 'Gerenciamento de Conteúdo',
    description: 'Domine as ferramentas de criação e edição de conteúdo',
    category: 'content',
    estimatedTime: '8 min',
    steps: [
      {
        id: 'editor',
        title: 'Editor de Texto',
        description: 'Use este editor para criar e formatar seu conteúdo. Ele suporta texto rico, imagens e vídeos.',
        target: '.rich-text-editor',
        position: 'top'
      },
      {
        id: 'questions',
        title: 'Inserindo Questões',
        description: 'Clique neste botão para inserir questões em qualquer parte do texto.',
        target: '.insert-question-button',
        position: 'bottom',
        action: 'Experimente clicar para ver como funciona'
      },
      {
        id: 'preview',
        title: 'Visualização',
        description: 'Sempre visualize seu conteúdo antes de publicar para garantir que está como deseja.',
        target: '.preview-button',
        position: 'left'
      }
    ]
  },
  {
    id: 'user-management',
    title: 'Gestão de Usuários',
    description: 'Aprenda a adicionar e gerenciar professores e alunos',
    category: 'users',
    estimatedTime: '6 min',
    steps: [
      {
        id: 'user-list',
        title: 'Lista de Usuários',
        description: 'Aqui você vê todos os usuários cadastrados: alunos, professores e administradores.',
        target: '.users-list',
        position: 'top'
      },
      {
        id: 'add-user',
        title: 'Adicionando Usuários',
        description: 'Use este botão para convidar novos professores ou cadastrar alunos.',
        target: '.add-user-button',
        position: 'bottom'
      },
      {
        id: 'permissions',
        title: 'Gerenciando Permissões',
        description: 'Defina o que cada professor pode ou não fazer no sistema.',
        target: '.permissions-section',
        position: 'right'
      }
    ]
  }
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  tourId?: string;
}

export function GuidedTour({ isOpen, onClose, tourId }: GuidedTourProps) {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (tourId) {
      const tour = tours.find(t => t.id === tourId);
      if (tour) {
        setSelectedTour(tour);
        setIsActive(true);
      }
    }
  }, [tourId]);

  const startTour = (tour: Tour) => {
    setSelectedTour(tour);
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (selectedTour && currentStep < selectedTour.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    setIsActive(false);
    setSelectedTour(null);
    setCurrentStep(0);
    onClose();
  };

  const skipTour = () => {
    setIsActive(false);
    setSelectedTour(null);
    setCurrentStep(0);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'getting-started': return 'bg-green-100 text-green-800';
      case 'content': return 'bg-blue-100 text-blue-800';
      case 'users': return 'bg-purple-100 text-purple-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'getting-started': return 'Primeiros Passos';
      case 'content': return 'Conteúdo';
      case 'users': return 'Usuários';
      case 'advanced': return 'Avançado';
      default: return 'Geral';
    }
  };

  if (!isOpen && !isActive) return null;

  // Tour ativo - overlay com passo atual
  if (isActive && selectedTour) {
    const currentStepData = selectedTour.steps[currentStep];
    const progress = ((currentStep + 1) / selectedTour.steps.length) * 100;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
              <p className="text-sm text-gray-600">
                Passo {currentStep + 1} de {selectedTour.steps.length}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={skipTour}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Progress value={progress} className="mb-4" />

          <div className="space-y-4">
            <p className="text-gray-700">{currentStepData.description}</p>

            {currentStepData.action && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Ação necessária:</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">{currentStepData.action}</p>
              </div>
            )}

            {currentStepData.tip && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Dica:</span>
                </div>
                <p className="text-sm text-amber-700 mt-1">{currentStepData.tip}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </Button>

            <Button onClick={nextStep} className="flex items-center gap-2">
              {currentStep === selectedTour.steps.length - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Concluir
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Seleção de tour
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Tours Guiados</h2>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            Escolha um tour para aprender a usar o sistema passo a passo
          </p>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tours.map(tour => (
              <Card key={tour.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{tour.title}</h3>
                        <Badge className={getCategoryColor(tour.category)}>
                          {getCategoryLabel(tour.category)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{tour.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>⏱️ {tour.estimatedTime}</span>
                        <span>📚 {tour.steps.length} passos</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => startTour(tour)}
                    className="w-full flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Iniciar Tour
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
