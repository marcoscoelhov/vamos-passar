
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeContext } from '@/hooks/useTheme';
import { logger } from '@/utils/logger';

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'light',
  enableSystem = false 
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<string>('light');

  const setTheme = useCallback((newTheme: string) => {
    // Force light theme only
    logger.info('Theme set to light (dark mode disabled)');
    setThemeState('light');
  }, []);

  const contextValue = useMemo(() => ({
    theme: 'light',
    setTheme
  }), [setTheme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add('light');
    logger.debug('Theme forced to light mode');
  }, []);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
