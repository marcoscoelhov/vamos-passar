
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Settings, Users, BookOpen, TrendingUp, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionRequired: boolean;
  category: 'system' | 'content' | 'users' | 'analytics';
  priority: 'low' | 'medium' | 'high';
}

export function AdvancedNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Conteúdo precisa de revisão',
      message: 'O tópico "Introdução ao React" tem baixa taxa de aprovação (45%). Considere revisar o conteúdo.',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      isRead: false,
      actionRequired: true,
      category: 'analytics',
      priority: 'high'
    },
    {
      id: '2',
      type: 'info',
      title: 'Novo professor adicionado',
      message: 'Prof. Carlos Silva foi adicionado ao sistema com permissões de editor.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: false,
      actionRequired: false,
      category: 'users',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'success',
      title: 'Backup concluído',
      message: 'Backup automático de todos os cursos foi concluído com sucesso.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      isRead: true,
      actionRequired: false,
      category: 'system',
      priority: 'low'
    },
    {
      id: '4',
      type: 'error',
      title: 'Falha na importação',
      message: 'Erro ao importar documento "Avançado.pdf". Verifique o formato do arquivo.',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      isRead: false,
      actionRequired: true,
      category: 'content',
      priority: 'high'
    }
  ]);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    analyticsAlerts: true,
    contentReviews: true,
    userActivities: false,
    systemUpdates: true
  });

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <X className="w-4 h-4 text-red-600" />;
      default: return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'users': return <Users className="w-4 h-4" />;
      case 'content': return <BookOpen className="w-4 h-4" />;
      case 'analytics': return <TrendingUp className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m atrás`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h atrás`;
    return `${Math.floor(diffMinutes / 1440)}d atrás`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-5 h-5 text-blue-600" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">{unreadCount}</span>
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold">Central de Notificações</h2>
        </div>
        
        <div className="flex gap-2">
          {actionRequiredCount > 0 && (
            <Badge variant="destructive">
              {actionRequiredCount} ações pendentes
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Marcar todas como lidas
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todas ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Não lidas ({unreadCount})</TabsTrigger>
          <TabsTrigger value="action">Ação ({actionRequiredCount})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`p-4 ${!notification.isRead ? 'bg-blue-50 border-blue-200' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{notification.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getCategoryIcon(notification.category)}
                        <span className="text-xs text-gray-500 capitalize">{notification.category}</span>
                        <Badge variant="outline" className="text-xs">
                          {notification.priority === 'high' ? 'Alta' : 
                           notification.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                        {notification.actionRequired && (
                          <Badge variant="destructive" className="text-xs">
                            Ação necessária
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                  
                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Marcar como lida
                      </Button>
                    )}
                    {notification.actionRequired && (
                      <Button size="sm">
                        Ver detalhes
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="unread">
          <div className="space-y-3">
            {notifications.filter(n => !n.isRead).map((notification) => (
              <Card key={notification.id} className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Marcar como lida
                      </Button>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="action">
          <div className="space-y-3">
            {notifications.filter(n => n.actionRequired && !n.isRead).map((notification) => (
              <Card key={notification.id} className="p-4 border-red-200 bg-red-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium text-red-900">{notification.title}</h3>
                    <p className="text-sm text-red-700 mt-1">{notification.message}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        Resolver agora
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Adiar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-3">
            {notifications.filter(n => n.category === 'analytics').map((notification) => (
              <Card key={notification.id} className="p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <Button size="sm" className="mt-2">
                      Ver analytics
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Preferências de Notificação</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificações por email</p>
                  <p className="text-sm text-gray-600">Receba notificações importantes por email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificações push</p>
                  <p className="text-sm text-gray-600">Notificações instantâneas no navegador</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, pushNotifications: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alertas de analytics</p>
                  <p className="text-sm text-gray-600">Avisos sobre performance e métricas</p>
                </div>
                <Switch
                  checked={settings.analyticsAlerts}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, analyticsAlerts: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Revisões de conteúdo</p>
                  <p className="text-sm text-gray-600">Notificações sobre conteúdo que precisa de revisão</p>
                </div>
                <Switch
                  checked={settings.contentReviews}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, contentReviews: checked }))
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
