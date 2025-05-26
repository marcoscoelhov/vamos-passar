
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
  defaultTheme = 'system',
  enableSystem = true 
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      logger.debug('Theme loaded from localStorage', { stored, defaultTheme });
      return stored || defaultTheme;
    }
    return defaultTheme;
  });

  const setTheme = useCallback((newTheme: string) => {
    logger.info('Theme changed', { from: theme, to: newTheme });
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  }, [theme]);

  const contextValue = useMemo(() => ({
    theme,
    setTheme
  }), [theme, setTheme]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (themeToApply: string) => {
      root.classList.remove('light', 'dark');
      root.classList.add(themeToApply);
      logger.debug('Theme applied to DOM', { theme: themeToApply });
    };

    if (theme === 'system' && enableSystem) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      applyTheme(systemTheme);

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const newSystemTheme = e.matches ? 'dark' : 'light';
        applyTheme(newSystemTheme);
        logger.debug('System theme changed', { theme: newSystemTheme });
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(theme);
    }
  }, [theme, enableSystem]);

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
