
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
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
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
      .subscribe();

    return () => {
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
