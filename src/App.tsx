
import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OptimizedCourseProvider } from "@/contexts/OptimizedCourseContext";
import { PerformanceProvider } from "@/contexts/PerformanceContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { logger } from "@/utils/logger";

// Lazy load pages
const Index = React.lazy(() => 
  import("./pages/Index").then(module => {
    logger.debug('Index page loaded');
    return module;
  }).catch(error => {
    logger.error('Error loading Index page', error);
    throw error;
  })
);

const Login = React.lazy(() => 
  import("./pages/Login").then(module => {
    logger.debug('Login page loaded');
    return module;
  }).catch(error => {
    logger.error('Error loading Login page', error);
    throw error;
  })
);

const Admin = React.lazy(() => 
  import("./pages/Admin").then(module => {
    logger.debug('Admin page loaded');
    return module;
  }).catch(error => {
    logger.error('Error loading Admin page', error);
    throw error;
  })
);

const NotFound = React.lazy(() => 
  import("./pages/NotFound").then(module => {
    logger.debug('NotFound page loaded');
    return module;
  }).catch(error => {
    logger.error('Error loading NotFound page', error);
    throw error;
  })
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    },
  },
});

const PageLoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <LoadingSkeleton variant="page" className="w-full max-w-4xl h-96" />
  </div>
);

const App = () => {
  logger.debug('App component rendering');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <PerformanceProvider>
              <OptimizedCourseProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <Index />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <Admin />
                          </ProtectedRoute>
                        }
                      />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </OptimizedCourseProvider>
            </PerformanceProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
