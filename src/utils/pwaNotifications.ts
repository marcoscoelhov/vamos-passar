
export interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  silent?: boolean;
  requireInteraction?: boolean;
}

export class PWANotificationManager {
  private static instance: PWANotificationManager;
  private swRegistration: ServiceWorkerRegistration | null = null;

  static getInstance(): PWANotificationManager {
    if (!PWANotificationManager.instance) {
      PWANotificationManager.instance = new PWANotificationManager();
    }
    return PWANotificationManager.instance;
  }

  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers não são suportados');
      return false;
    }

    if (!('Notification' in window)) {
      console.warn('Notificações não são suportadas');
      return false;
    }

    try {
      // Registrar service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', this.swRegistration);
      return true;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  async showNotification(config: NotificationConfig): Promise<boolean> {
    const permission = await this.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('Permissão de notificação negada');
      return false;
    }

    try {
      if (this.swRegistration) {
        // Usar service worker para notificações persistentes
        await this.swRegistration.showNotification(config.title, {
          body: config.body,
          icon: config.icon || '/favicon.ico',
          badge: config.badge || '/favicon.ico',
          tag: config.tag,
          data: config.data,
          silent: config.silent,
          requireInteraction: config.requireInteraction,
        });
      } else {
        // Fallback para notificação simples
        new Notification(config.title, {
          body: config.body,
          icon: config.icon || '/favicon.ico',
          tag: config.tag,
          data: config.data,
          silent: config.silent,
          requireInteraction: config.requireInteraction,
        });
      }
      return true;
    } catch (error) {
      console.error('Erro ao exibir notificação:', error);
      return false;
    }
  }

  // Notificações específicas do sistema
  async notifyNewContent(courseName: string, topicTitle: string): Promise<void> {
    await this.showNotification({
      title: 'Novo conteúdo disponível!',
      body: `${topicTitle} foi adicionado ao curso ${courseName}`,
      icon: '/favicon.ico',
      tag: 'new-content',
      data: { type: 'new-content', courseName, topicTitle },
      requireInteraction: true
    });
  }

  async notifyProgress(courseName: string, progressPercentage: number): Promise<void> {
    if (progressPercentage % 25 === 0) { // Notificar a cada 25%
      await this.showNotification({
        title: 'Progresso no curso!',
        body: `Você completou ${progressPercentage}% do curso ${courseName}`,
        icon: '/favicon.ico',
        tag: 'progress',
        data: { type: 'progress', courseName, progressPercentage }
      });
    }
  }

  async notifyDeadline(courseName: string, daysLeft: number): Promise<void> {
    await this.showNotification({
      title: 'Prazo se aproximando!',
      body: `Faltam ${daysLeft} dias para completar o curso ${courseName}`,
      icon: '/favicon.ico',
      tag: 'deadline',
      data: { type: 'deadline', courseName, daysLeft },
      requireInteraction: true
    });
  }

  async scheduleNotification(config: NotificationConfig, delay: number): Promise<void> {
    setTimeout(async () => {
      await this.showNotification(config);
    }, delay);
  }

  // Gerenciar assinatura para push notifications
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      console.error('Service Worker não registrado');
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          'YOUR_VAPID_PUBLIC_KEY' // Substitua pela sua chave VAPID
        )
      });

      console.log('Inscrito em push notifications:', subscription);
      return subscription;
    } catch (error) {
      console.error('Erro ao se inscrever em push notifications:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Hook para usar o sistema de notificações
export function useNotificationManager() {
  const notificationManager = PWANotificationManager.getInstance();

  return {
    initialize: () => notificationManager.initialize(),
    requestPermission: () => notificationManager.requestPermission(),
    showNotification: (config: NotificationConfig) => notificationManager.showNotification(config),
    notifyNewContent: (courseName: string, topicTitle: string) => 
      notificationManager.notifyNewContent(courseName, topicTitle),
    notifyProgress: (courseName: string, progressPercentage: number) => 
      notificationManager.notifyProgress(courseName, progressPercentage),
    notifyDeadline: (courseName: string, daysLeft: number) => 
      notificationManager.notifyDeadline(courseName, daysLeft),
    scheduleNotification: (config: NotificationConfig, delay: number) => 
      notificationManager.scheduleNotification(config, delay),
    subscribeToPush: () => notificationManager.subscribeToPush(),
  };
}
