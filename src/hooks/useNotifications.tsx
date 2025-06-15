import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionable?: boolean;
  webhookLogId?: string;
  eventType?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔔 [NOTIF] Initializing notifications system...');
    
    // Simular algumas notificações iniciais
    const initialNotifications: Notification[] = [
      {
        id: '1',
        type: 'info',
        title: 'Sistema iniciado',
        message: 'Sistema de notificações em tempo real ativo',
        timestamp: new Date(),
        read: false,
        actionable: false
      }
    ];
    
    setNotifications(initialNotifications);
    setIsLoading(false);

    // Configurar listeners para mudanças em tempo real
    console.log('🔔 [NOTIF] Setting up real-time listeners...');
    
    // Test basic connectivity
    const testChannel = supabase
      .channel('test_connection')
      .subscribe((status) => {
        console.log('🔔 [NOTIF] Test channel status:', status);
      });

    const mainChannel = supabase
      .channel('admin_notifications_main')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webhook_logs'
        },
        (payload) => {
          console.log('🔔 [NOTIF] ===== WEBHOOK LOG DETECTED =====');
          console.log('🔔 [NOTIF] Raw payload:', JSON.stringify(payload, null, 2));
          
          const log = payload.new;
          console.log('🔔 [NOTIF] Processing log:', {
            id: log.id,
            event_type: log.event_type,
            status_code: log.status_code,
            error_message: log.error_message,
            payload_keys: Object.keys(log.payload || {}),
            created_at: log.created_at
          });
          
          // Determinar tipo de notificação
          let notificationType: 'success' | 'error' | 'warning' | 'info' = 'info';
          let title = 'Webhook processado';
          let message = `Evento ${log.event_type || 'desconhecido'} processado`;
          
          // Verificar se é erro
          if (log.status_code && log.status_code >= 400) {
            notificationType = 'error';
            title = 'Erro no webhook';
            message = `Falha ao processar ${log.event_type}: ${log.error_message || 'Erro desconhecido'}`;
            console.log('🔔 [NOTIF] ❌ Error notification created');
          } 
          // Verificar eventos do Kwify
          else if (log.event_type?.includes('sale') || log.event_type?.includes('payment') || log.event_type?.includes('kwify')) {
            console.log('🔔 [NOTIF] 💰 Kwify event detected:', log.event_type);
            notificationType = 'success';
            
            switch (log.event_type) {
              case 'sale.completed':
                title = '🎉 Nova venda Kwify!';
                message = 'Uma nova venda foi processada e a matrícula foi criada automaticamente';
                break;
              case 'payment.approved':
                title = '💳 Pagamento aprovado';
                message = 'Pagamento foi aprovado no Kwify';
                break;
              case 'sale.refunded':
                title = '🔄 Reembolso processado';
                message = 'Um reembolso foi processado no Kwify';
                notificationType = 'warning';
                break;
              case 'payment.refunded':
                title = '💸 Pagamento reembolsado';
                message = 'Um pagamento foi reembolsado no Kwify';
                notificationType = 'warning';
                break;
              default:
                title = '🔗 Evento Kwify';
                message = `Evento ${log.event_type} processado com sucesso`;
            }
          }

          const newNotification: Notification = {
            id: `webhook-${log.id}`,
            type: notificationType,
            title,
            message,
            timestamp: new Date(log.created_at),
            read: false,
            actionable: true,
            webhookLogId: log.id,
            eventType: log.event_type
          };
          
          console.log('🔔 [NOTIF] ✅ Adding notification:', {
            id: newNotification.id,
            type: newNotification.type,
            title: newNotification.title,
            eventType: newNotification.eventType
          });
          
          setNotifications(prev => {
            const updated = [newNotification, ...prev];
            console.log('🔔 [NOTIF] Total notifications after add:', updated.length);
            return updated;
          });
          
          // Mostrar toast para eventos importantes
          if (notificationType === 'error' || log.event_type === 'sale.completed' || log.event_type === 'payment.approved') {
            console.log('🔔 [NOTIF] 🎯 Showing toast for important event');
            toast({
              title,
              description: message,
              variant: notificationType === 'error' ? 'destructive' : 'default',
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'course_enrollments'
        },
        (payload) => {
          console.log('🔔 [NOTIF] 📝 Course enrollment detected:', payload);
          
          const newNotification: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'info',
            title: 'Nova matrícula',
            message: 'Um novo estudante se matriculou em um curso',
            timestamp: new Date(),
            read: false,
            actionable: true
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          
          toast({
            title: 'Nova matrícula',
            description: 'Um novo estudante se matriculou em um curso',
          });
        }
      )
      .subscribe((status) => {
        console.log('🔔 [NOTIF] Main channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('🔔 [NOTIF] ✅ Successfully subscribed to real-time events');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('🔔 [NOTIF] ❌ Channel subscription error');
        }
      });

    return () => {
      console.log('🔔 [NOTIF] 🧹 Cleaning up notification channels...');
      supabase.removeChannel(testChannel);
      supabase.removeChannel(mainChannel);
    };
  }, [toast]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    addNotification,
  };
}
