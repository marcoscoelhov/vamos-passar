
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  Check, 
  X, 
  Users, 
  BookOpen, 
  AlertCircle,
  Clock,
  CheckCircle,
  Webhook,
  ShoppingCart,
  CreditCard,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification
  } = useNotifications();

  const getNotificationIcon = (type: string, eventType?: string) => {
    if (eventType?.includes('sale.completed')) return <ShoppingCart className="w-4 h-4 text-green-500" />;
    if (eventType?.includes('payment.approved')) return <CreditCard className="w-4 h-4 text-blue-500" />;
    if (eventType?.includes('refund')) return <RefreshCw className="w-4 h-4 text-yellow-500" />;
    if (eventType?.includes('webhook') || eventType?.includes('kwify')) return <Webhook className="w-4 h-4 text-purple-500" />;
    
    switch (type) {
      case 'info': return <Users className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <X className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) {
      return 'agora';
    } else if (minutes < 60) {
      return `${minutes}m atrás`;
    } else if (hours < 24) {
      return `${hours}h atrás`;
    } else {
      return timestamp.toLocaleDateString('pt-BR');
    }
  };

  const handleNotificationAction = (notification: any) => {
    console.log('🔔 [UI] Notification action clicked:', notification);
    
    if (notification.webhookLogId) {
      toast({
        title: 'Detalhes do Webhook',
        description: `Log ID: ${notification.webhookLogId} - Evento: ${notification.eventType}`,
      });
    } else if (notification.eventType === 'enrollment') {
      toast({
        title: 'Ver estudantes',
        description: 'Redirecionando para gestão de estudantes...',
      });
    }
    markAsRead(notification.id);
  };

  // Debug: Log current notifications
  React.useEffect(() => {
    console.log('🔔 [UI] Current notifications:', notifications.length);
    console.log('🔔 [UI] Unread count:', unreadCount);
  }, [notifications, unreadCount]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log('🔔 [UI] Notification center toggled, isOpen:', !isOpen);
          setIsOpen(!isOpen);
        }}
        className="relative p-2"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 z-50 shadow-lg border">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notificações ({notifications.length})</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log('🔔 [UI] Mark all as read clicked');
                      markAllAsRead();
                    }}
                    className="text-xs"
                  >
                    Marcar todas como lidas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className="h-96">
            <div className="p-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        notification.read 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type, notification.eventType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm text-gray-900">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                            {notification.eventType && (
                              <Badge variant="outline" className="text-xs">
                                {notification.eventType}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <div className="flex gap-1">
                              {notification.actionable && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleNotificationAction(notification)}
                                  className="h-6 px-2 text-xs"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Ver
                                </Button>
                              )}
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    console.log('🔔 [UI] Mark as read clicked for:', notification.id);
                                    markAsRead(notification.id);
                                  }}
                                  className="h-6 px-2 text-xs"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  console.log('🔔 [UI] Remove notification clicked for:', notification.id);
                                  removeNotification(notification.id);
                                }}
                                className="h-6 px-2 text-xs"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}
