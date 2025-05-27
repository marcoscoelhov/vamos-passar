
import React from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

// Simplified ThemeProvider - light mode only
export function ThemeProvider({ children }: ThemeProviderProps) {
  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
  }, []);

  return <>{children}</>;
}

export function useTheme() {
  return {
    theme: 'light' as const,
    setTheme: () => {}, // No-op function for compatibility
  };
}
