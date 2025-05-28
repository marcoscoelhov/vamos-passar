
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { logger } from '@/utils/logger';

interface SectionErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  sectionName?: string;
  onReset?: () => void;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class SectionErrorBoundary extends React.Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error: Error): SectionErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { sectionName } = this.props;
    
    logger.error(`Error in ${sectionName || 'section'}:`, { 
      error: error.message, 
      stack: error.stack, 
      componentStack: errorInfo.componentStack 
    });
  }
  
  handleReset() {
    const { onReset } = this.props;
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    if (onReset) {
      onReset();
    }
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback, sectionName } = this.props;
    
    if (hasError) {
      if (fallback) {
        return fallback;
      }
      
      return (
        <Card className="p-6 border-red-100">
          <div className="flex flex-col items-center text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Erro em {sectionName || 'componente'}
            </h3>
            <p className="text-gray-600 mb-4">
              {error?.message || 'Ocorreu um erro ao renderizar este componente'}
            </p>
            <Button 
              onClick={this.handleReset}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </Button>
          </div>
        </Card>
      );
    }

    return children;
  }
}
