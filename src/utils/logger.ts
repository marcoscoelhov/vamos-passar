
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  source?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private enabledLevels: LogLevel[] = this.isDevelopment 
    ? ['debug', 'info', 'warn', 'error']
    : ['info', 'warn', 'error']; // Habilitado info em produção para debug

  private formatMessage(level: LogLevel, message: string, data?: any, source?: string): void {
    if (!this.enabledLevels.includes(level)) return;

    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = { level, message, timestamp, data, source };

    const style = this.getLogStyle(level);
    const prefix = source ? `[${source.toUpperCase()}]` : '';
    
    if (data) {
      console[level](`%c${prefix} [${level.toUpperCase()}] ${message}`, style, data);
    } else {
      console[level](`%c${prefix} [${level.toUpperCase()}] ${message}`, style);
    }

    // Armazenar logs importantes no localStorage para debug
    if (level === 'error' || level === 'warn') {
      this.storeLog(logEntry);
    }
  }

  private storeLog(entry: LogEntry): void {
    try {
      const stored = JSON.parse(localStorage.getItem('debug_logs') || '[]');
      stored.push(entry);
      
      // Manter apenas os últimos 100 logs
      if (stored.length > 100) {
        stored.splice(0, stored.length - 100);
      }
      
      localStorage.setItem('debug_logs', JSON.stringify(stored));
    } catch (e) {
      // Ignorar erros de localStorage
    }
  }

  private getLogStyle(level: LogLevel): string {
    const styles = {
      debug: 'color: #666; font-weight: normal;',
      info: 'color: #2563eb; font-weight: normal;',
      warn: 'color: #d97706; font-weight: bold;',
      error: 'color: #dc2626; font-weight: bold;'
    };
    return styles[level];
  }

  debug(message: string, data?: any, source?: string): void {
    this.formatMessage('debug', message, data, source);
  }

  info(message: string, data?: any, source?: string): void {
    this.formatMessage('info', message, data, source);
  }

  warn(message: string, data?: any, source?: string): void {
    this.formatMessage('warn', message, data, source);
  }

  error(message: string, data?: any, source?: string): void {
    this.formatMessage('error', message, data, source);
  }

  // Métodos específicos para diferentes componentes
  webhook(level: LogLevel, message: string, data?: any): void {
    this.formatMessage(level, message, data, 'webhook');
  }

  notification(level: LogLevel, message: string, data?: any): void {
    this.formatMessage(level, message, data, 'notification');
  }

  api(level: LogLevel, message: string, data?: any): void {
    this.formatMessage(level, message, data, 'api');
  }

  // Obter logs armazenados para debug
  getStoredLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('debug_logs') || '[]');
    } catch (e) {
      return [];
    }
  }

  // Limpar logs armazenados
  clearStoredLogs(): void {
    localStorage.removeItem('debug_logs');
  }
}

export const logger = new Logger();
