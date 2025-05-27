
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { HelpCircle, Search, Bookmark, Keyboard, ChevronRight } from 'lucide-react';

const helpSections = [
  {
    title: 'Navegação',
    items: [
      'Use a barra lateral para navegar entre os tópicos',
      'Clique nos botões "Anterior" e "Próximo" para navegar sequencialmente',
      'Use os breadcrumbs para voltar a tópicos anteriores na hierarquia',
    ],
  },
  {
    title: 'Busca',
    items: [
      'Use Cmd/Ctrl + K para abrir a busca global',
      'Busque por títulos de tópicos ou conteúdo',
      'Clique em qualquer resultado para navegar diretamente',
    ],
  },
  {
    title: 'Marcadores',
    items: [
      'Clique no ícone de marcador nos tópicos para salvá-los',
      'Acesse seus marcadores através do menu superior',
      'Marcadores são salvos localmente no seu navegador',
    ],
  },
  {
    title: 'Atalhos de Teclado',
    items: [
      'Cmd/Ctrl + K: Abrir busca',
      'Cmd/Ctrl + ←/→: Navegar entre tópicos',
      'Cmd/Ctrl + Enter: Marcar como concluído',
      'Cmd/Ctrl + Q: Ir para questões',
    ],
  },
  {
    title: 'Destaques',
    items: [
      'Selecione texto no conteúdo para criar destaques',
      'Adicione notas aos seus destaques',
      'Seus destaques ficam salvos para consulta posterior',
    ],
  },
];

export const HelpDialog = React.memo(function HelpDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Ajuda</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Como usar a plataforma</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {helpSections.map((section, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {section.title === 'Busca' && <Search className="w-5 h-5" />}
                {section.title === 'Marcadores' && <Bookmark className="w-5 h-5" />}
                {section.title === 'Atalhos de Teclado' && <Keyboard className="w-5 h-5" />}
                {section.title === 'Navegação' && <ChevronRight className="w-5 h-5" />}
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Dica:</strong> Sua experiência de aprendizado é salva automaticamente. 
              Progresso, marcadores e destaques ficam salvos para quando você voltar.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
