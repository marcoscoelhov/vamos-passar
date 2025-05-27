
import React from 'react';
import { Button } from '@/components/ui/button';

// Simplified theme toggle - disabled and shows light mode only
export function ThemeToggle() {
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled
      className="w-9 h-9 p-0 opacity-50 cursor-not-allowed"
      title="Modo claro ativo"
    >
      <span className="text-xs">☀️</span>
      <span className="sr-only">Modo claro</span>
    </Button>
  );
}
