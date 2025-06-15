
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';

interface VisualContentProps {
  type: 'diagram' | 'chart' | 'infographic' | 'interactive';
  title: string;
  description?: string;
  data?: any;
  className?: string;
}

export function VisualContent({ 
  type, 
  title, 
  description, 
  data, 
  className = '' 
}: VisualContentProps) {
  const getIcon = () => {
    switch (type) {
      case 'diagram':
        return <Activity className="w-6 h-6" />;
      case 'chart':
        return <BarChart3 className="w-6 h-6" />;
      case 'infographic':
        return <PieChart className="w-6 h-6" />;
      case 'interactive':
        return <TrendingUp className="w-6 h-6" />;
      default:
        return <BarChart3 className="w-6 h-6" />;
    }
  };

  const renderVisualPlaceholder = () => {
    switch (type) {
      case 'diagram':
        return (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <Activity className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Diagrama Interativo</h3>
              <p className="text-blue-600">Visualização dos conceitos principais</p>
            </div>
          </div>
        );
      case 'chart':
        return (
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">Gráfico Explicativo</h3>
              <p className="text-green-600">Dados e estatísticas relevantes</p>
            </div>
          </div>
        );
      case 'infographic':
        return (
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <PieChart className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Infográfico</h3>
              <p className="text-purple-600">Informação visual organizada</p>
            </div>
          </div>
        );
      case 'interactive':
        return (
          <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-orange-800 mb-2">Conteúdo Interativo</h3>
              <p className="text-orange-600">Elemento interativo para aprendizado</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={`my-8 border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 font-display">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 font-reading mt-1">{description}</p>
            )}
          </div>
        </div>
        
        {renderVisualPlaceholder()}
      </CardContent>
    </Card>
  );
}
