
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { logger } from '@/utils/logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorCount: number;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      errorCount: 0 
    };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Incremento do contador de erros
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    logger.error('ErrorBoundary caught an error', { 
      error: error.message, 
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorCount: this.state.errorCount + 1
    });
  }

  handleReset() {
    const { onReset } = this.props;
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined 
    });
    
    if (onReset) {
      onReset();
    }
  }

  render() {
    const { hasError, error, errorCount } = this.state;
    const { children, fallback } = this.props;
    
    if (hasError) {
      if (fallback) {
        return fallback;
      }
      
      // Componente padrão para exibição de erros
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="p-8 max-w-md w-full text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Algo deu errado</h2>
            <p className="text-gray-600 mb-4">
              {errorCount > 3 
                ? 'Estamos enfrentando um problema persistente. Tente atualizar a página inteira.'
                : 'Ocorreu um erro inesperado. Tente novamente.'}
            </p>
            {error && error.message && (
              <div className="mb-4 p-2 bg-gray-50 rounded text-left">
                <code className="text-sm text-red-600 break-all">{error.message}</code>
              </div>
            )}
            <Button 
              onClick={this.handleReset}
              className="flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              {errorCount > 3 ? 'Recarregar Página' : 'Tentar Novamente'}
            </Button>
          </Card>
        </div>
      );
    }

    return children;
  }
}
