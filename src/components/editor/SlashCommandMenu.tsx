
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  Quote, 
  List, 
  ListOrdered, 
  Code, 
  HelpCircle,
  Hash
} from 'lucide-react';

interface SlashCommandMenuProps {
  onCommand: (command: string) => void;
  onClose: () => void;
}

const commands = [
  { id: 'h1', label: 'Título Grande', icon: Heading1, description: 'Seção principal' },
  { id: 'h2', label: 'Título Médio', icon: Heading2, description: 'Subseção' },
  { id: 'h3', label: 'Título Pequeno', icon: Heading3, description: 'Sub-subseção' },
  { id: 'quote', label: 'Citação', icon: Quote, description: 'Bloco de citação' },
  { id: 'bullet', label: 'Lista com Marcadores', icon: List, description: 'Lista não ordenada' },
  { id: 'numbered', label: 'Lista Numerada', icon: ListOrdered, description: 'Lista ordenada' },
  { id: 'code', label: 'Bloco de Código', icon: Code, description: 'Código formatado' },
  { id: 'question', label: 'Questão', icon: HelpCircle, description: 'Inserir questão interativa' },
];

export function SlashCommandMenu({ onCommand, onClose }: SlashCommandMenuProps) {
  return (
    <Card className="absolute z-50 w-80 p-2 shadow-lg border mt-2 bg-white">
      <div className="space-y-1">
        {commands.map((command) => {
          const Icon = command.icon;
          return (
            <Button
              key={command.id}
              variant="ghost"
              size="sm"
              className="w-full justify-start h-auto p-3 hover:bg-blue-50"
              onClick={() => onCommand(command.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-1 bg-gray-100 rounded">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{command.label}</div>
                  <div className="text-xs text-gray-500">{command.description}</div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
      
      <div className="mt-2 pt-2 border-t text-xs text-gray-400 px-2">
        Use as setas ↑↓ para navegar, Enter para selecionar, Esc para fechar
      </div>
    </Card>
  );
}
