
import React from 'react';
import { Button } from '@/components/ui/button';

// Theme toggle disabled - app now uses light mode only
export function ThemeToggle() {
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled
      className="w-9 h-9 p-0 opacity-50 cursor-not-allowed"
      title="Modo escuro desabilitado"
    >
      <span className="text-xs">☀️</span>
      <span className="sr-only">Light mode only</span>
    </Button>
  );
}
