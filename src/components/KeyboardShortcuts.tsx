
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

const shortcuts = [
  {
    keys: ['⌘', 'K'],
    description: 'Abrir busca global',
  },
  {
    keys: ['⌘', '→'],
    description: 'Próximo tópico',
  },
  {
    keys: ['⌘', '←'],
    description: 'Tópico anterior',
  },
  {
    keys: ['⌘', 'Enter'],
    description: 'Marcar tópico como concluído',
  },
  {
    keys: ['⌘', 'Q'],
    description: 'Ir para questões',
  },
];

export const KeyboardShortcuts = React.memo(function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Keyboard className="w-4 h-4" />
          <span className="hidden sm:inline">Atalhos</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atalhos de Teclado</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <React.Fragment key={keyIndex}>
                    <kbd className="inline-flex items-center rounded border bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
                      {key}
                    </kbd>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className="text-xs text-gray-400">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
});
