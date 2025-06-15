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
    console.log('🔔 Initializing notifications system...');
    
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

    // Configurar listener para mudanças em tempo real
    console.log('🔔 Setting up real-time listeners...');
    
    const channel = supabase
      .channel('admin_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'course_enrollments'
        },
        (payload) => {
          console.log('📝 Course enrollment change detected:', payload);
          
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
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'topics'
        },
        (payload) => {
          console.log('📚 Topic change detected:', payload);
          
          const newNotification: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'success',
            title: 'Novo tópico criado',
            message: 'Um novo tópico foi adicionado ao curso',
            timestamp: new Date(),
            read: false,
            actionable: true
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          
          toast({
            title: 'Novo tópico',
            description: 'Um novo tópico foi adicionado ao curso',
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webhook_logs'
        },
        (payload) => {
          console.log('🪝 Webhook log received:', payload);
          const log = payload.new;
          
          console.log('🪝 Processing webhook log:', {
            id: log.id,
            event_type: log.event_type,
            status_code: log.status_code,
            error_message: log.error_message,
            created_at: log.created_at
          });
          
          let notificationType: 'success' | 'error' | 'warning' = 'success';
          let title = 'Webhook processado';
          let message = `Evento ${log.event_type} processado`;
          
          // Definir tipo e mensagem baseado no status
          if (log.status_code && log.status_code >= 400) {
            notificationType = 'error';
            title = 'Erro no webhook';
            message = `Falha ao processar ${log.event_type}: ${log.error_message || 'Erro desconhecido'}`;
            console.log('❌ Webhook error detected:', message);
          } else if (log.event_type?.includes('kwify') || log.event_type?.includes('sale') || log.event_type?.includes('payment')) {
            console.log('💰 Kwify event detected:', log.event_type);
            
            if (log.event_type === 'sale.completed') {
              title = 'Nova venda Kwify';
              message = 'Uma nova venda foi processada e a matrícula foi criada';
              console.log('✅ Sale completed notification created');
            } else if (log.event_type === 'payment.approved') {
              title = 'Pagamento aprovado';
              message = 'Pagamento foi aprovado no Kwify';
              console.log('✅ Payment approved notification created');
            } else if (log.event_type === 'sale.refunded') {
              title = 'Reembolso processado';
              message = 'Um reembolso foi processado no Kwify';
              notificationType = 'warning';
              console.log('⚠️ Refund notification created');
            } else {
              console.log('ℹ️ Other Kwify event:', log.event_type);
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
          
          console.log('🔔 Adding notification:', newNotification);
          setNotifications(prev => [newNotification, ...prev]);
          
          // Toast apenas para erros ou vendas importantes
          if (notificationType === 'error' || log.event_type === 'sale.completed') {
            console.log('🎯 Showing toast for important event');
            toast({
              title,
              description: message,
              variant: notificationType === 'error' ? 'destructive' : 'default',
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('🔔 Channel subscription status:', status);
      });

    return () => {
      console.log('🔔 Cleaning up notifications channel...');
      supabase.removeChannel(channel);
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
