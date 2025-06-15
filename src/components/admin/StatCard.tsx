
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'gray';
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  badge?: string;
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  color = 'blue', 
  trend,
  badge 
}: StatCardProps) {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'from-blue-500 to-blue-600',
        icon: 'bg-blue-100 text-blue-600',
        badge: 'bg-blue-50 text-blue-700 border-blue-200'
      },
      green: {
        bg: 'from-green-500 to-green-600',
        icon: 'bg-green-100 text-green-600',
        badge: 'bg-green-50 text-green-700 border-green-200'
      },
      purple: {
        bg: 'from-purple-500 to-purple-600',
        icon: 'bg-purple-100 text-purple-600',
        badge: 'bg-purple-50 text-purple-700 border-purple-200'
      },
      amber: {
        bg: 'from-amber-500 to-amber-600',
        icon: 'bg-amber-100 text-amber-600',
        badge: 'bg-amber-50 text-amber-700 border-amber-200'
      },
      red: {
        bg: 'from-red-500 to-red-600',
        icon: 'bg-red-100 text-red-600',
        badge: 'bg-red-50 text-red-700 border-red-200'
      },
      gray: {
        bg: 'from-gray-500 to-gray-600',
        icon: 'bg-gray-100 text-gray-600',
        badge: 'bg-gray-50 text-gray-700 border-gray-200'
      }
    };
    return colors[color];
  };

  const colorClasses = getColorClasses(color);

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group border-0 shadow-sm">
      {/* Background gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div className={`w-full h-full bg-gradient-to-br ${colorClasses.bg} rounded-full -translate-y-16 translate-x-16`}></div>
      </div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorClasses.icon} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6" />
          </div>
          {badge && (
            <Badge className={`${colorClasses.badge} border shadow-sm`}>
              {badge}
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-600">{title}</h3>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          
          {(description || trend) && (
            <div className="flex items-center justify-between pt-2">
              {description && (
                <p className="text-sm text-slate-500">{description}</p>
              )}
              {trend && (
                <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(trend.direction)}`}>
                  <span>{getTrendIcon(trend.direction)}</span>
                  <span>{trend.value}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
