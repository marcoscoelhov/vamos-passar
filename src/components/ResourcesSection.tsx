
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, Headphones, ExternalLink, Download } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  type: 'book' | 'podcast' | 'tool' | 'download';
  description: string;
  url?: string;
  image?: string;
}

interface ResourcesSectionProps {
  resources?: Resource[];
}

export function ResourcesSection({ resources = [] }: ResourcesSectionProps) {
  const defaultResources: Resource[] = [
    {
      id: '1',
      title: 'Livro Recomendado: Fundamentos',
      type: 'book',
      description: 'Um guia completo sobre os conceitos fundamentais abordados neste tópico.',
      url: '#'
    },
    {
      id: '2',
      title: 'Podcast: Discussão Avançada',
      type: 'podcast',
      description: 'Episódio que aprofunda os temas tratados nesta aula.',
      url: '#'
    },
    {
      id: '3',
      title: 'Ferramenta Prática',
      type: 'tool',
      description: 'Aplicação online para praticar os conceitos aprendidos.',
      url: '#'
    },
    {
      id: '4',
      title: 'Material Complementar',
      type: 'download',
      description: 'PDF com exercícios e exemplos adicionais.',
      url: '#'
    }
  ];

  const resourcesToShow = resources.length > 0 ? resources : defaultResources;

  const getIcon = (type: Resource['type']) => {
    switch (type) {
      case 'book':
        return <Book className="w-5 h-5" />;
      case 'podcast':
        return <Headphones className="w-5 h-5" />;
      case 'tool':
        return <ExternalLink className="w-5 h-5" />;
      case 'download':
        return <Download className="w-5 h-5" />;
      default:
        return <Book className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: Resource['type']) => {
    switch (type) {
      case 'book':
        return 'Livro';
      case 'podcast':
        return 'Podcast';
      case 'tool':
        return 'Ferramenta';
      case 'download':
        return 'Download';
      default:
        return 'Recurso';
    }
  };

  return (
    <section className="mt-16 lg:mt-24">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-display text-gray-900 mb-4">
          Recursos Complementares
        </h2>
        <p className="text-lg text-gray-600 font-reading">
          Materiais adicionais para aprofundar seus conhecimentos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resourcesToShow.map((resource) => (
          <Card key={resource.id} className="hover:shadow-lg transition-all duration-300 border-gray-100">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                  {getIcon(resource.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {getTypeLabel(resource.type)}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 font-display">
                    {resource.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-600 mb-4 font-reading leading-relaxed">
                {resource.description}
              </p>
              {resource.url && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.open(resource.url, '_blank')}
                >
                  Acessar Recurso
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
