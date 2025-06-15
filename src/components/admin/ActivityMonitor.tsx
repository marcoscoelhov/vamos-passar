
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Users, 
  BookOpen, 
  FileText, 
  Clock,
  TrendingUp
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'user_login' | 'course_enrollment' | 'topic_created' | 'content_added';
  description: string;
  timestamp: Date;
  user?: string;
}

export function ActivityMonitor() {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'user_login',
      description: 'Maria Silva fez login no sistema',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      user: 'Maria Silva'
    },
    {
      id: '2',
      type: 'course_enrollment',
      description: 'João Santos se matriculou em JavaScript Avançado',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      user: 'João Santos'
    },
    {
      id: '3',
      type: 'topic_created',
      description: 'Novo tópico "Promises e Async/Await" foi criado',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      user: 'Admin'
    }
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_login': return <Users className="w-4 h-4 text-blue-500" />;
      case 'course_enrollment': return <BookOpen className="w-4 h-4 text-green-500" />;
      case 'topic_created': return <FileText className="w-4 h-4 text-purple-500" />;
      case 'content_added': return <TrendingUp className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'user_login': return <Badge variant="outline" className="text-blue-600 border-blue-200">Login</Badge>;
      case 'course_enrollment': return <Badge variant="outline" className="text-green-600 border-green-200">Matrícula</Badge>;
      case 'topic_created': return <Badge variant="outline" className="text-purple-600 border-purple-200">Conteúdo</Badge>;
      case 'content_added': return <Badge variant="outline" className="text-orange-600 border-orange-200">Upload</Badge>;
      default: return <Badge variant="outline">Atividade</Badge>;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    return timestamp.toLocaleDateString();
  };

  return (
    <Card className="h-96">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80 px-6">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getActivityBadge(activity.type)}
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
