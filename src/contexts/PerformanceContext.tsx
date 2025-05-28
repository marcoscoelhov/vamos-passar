import React, { createContext, useContext, useCallback, useRef, useMemo } from 'react';
import { logger } from '@/utils/logger';

interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  rerenderCount: number;
  cacheHitRate: number;
}

interface PerformanceContextType {
  trackRender: (componentName: string) => () => void;
  trackRerender: (componentName: string) => void;
  getMetrics: () => PerformanceMetrics;
  enableProfiling: boolean;
  setEnableProfiling: (enabled: boolean) => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export const PerformanceProvider = React.memo(function PerformanceProvider({ 
  children 
}: PerformanceProviderProps) {
  const metricsRef = useRef({
    renderTimes: new Map<string, number[]>(),
    rerenderCounts: new Map<string, number>(),
    componentCount: 0,
  });
  const [enableProfiling, setEnableProfiling] = React.useState(
    process.env.NODE_ENV === 'development'
  );

  const trackRender = useCallback((componentName: string) => {
    if (!enableProfiling) return () => {};

    const startTime = performance.now();
    metricsRef.current.componentCount++;

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      const times = metricsRef.current.renderTimes.get(componentName) || [];
      times.push(renderTime);
      
      // Keep only last 10 measurements to avoid memory leaks
      if (times.length > 10) {
        times.shift();
      }
      
      metricsRef.current.renderTimes.set(componentName, times);
      
      if (renderTime > 16) { // Longer than one frame
        logger.warn('Slow render detected', { 
          component: componentName, 
          renderTime: renderTime.toFixed(2) 
        });
      }
    };
  }, [enableProfiling]);

  const trackRerender = useCallback((componentName: string) => {
    if (!enableProfiling) return;

    const current = metricsRef.current.rerenderCounts.get(componentName) || 0;
    metricsRef.current.rerenderCounts.set(componentName, current + 1);
    
    if (current > 5) {
      logger.warn('Excessive rerenders detected', { 
        component: componentName, 
        count: current + 1 
      });
    }
  }, [enableProfiling]);

  const getMetrics = useCallback((): PerformanceMetrics => {
    const renderTimes = Array.from(metricsRef.current.renderTimes.values()).flat();
    const avgRenderTime = renderTimes.length > 0 
      ? renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length 
      : 0;

    const totalRerenders = Array.from(metricsRef.current.rerenderCounts.values())
      .reduce((sum, count) => sum + count, 0);

    return {
      renderTime: avgRenderTime,
      componentCount: metricsRef.current.componentCount,
      rerenderCount: totalRerenders,
      cacheHitRate: 0, // Will be updated by cache implementations
    };
  }, []);

  const contextValue = useMemo(() => ({
    trackRender,
    trackRerender,
    getMetrics,
    enableProfiling,
    setEnableProfiling,
  }), [trackRender, trackRerender, getMetrics, enableProfiling]);

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
});
