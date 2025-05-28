
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  
  private log(level: LogLevel, message: string, data?: any) {
    if (!this.isDevelopment && level === 'debug') {
      return; // Skip debug logs in production
    }

    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    switch (level) {
      case 'debug':
        console.debug(`[${entry.timestamp}] DEBUG:`, message, data || '');
        break;
      case 'info':
        console.info(`[${entry.timestamp}] INFO:`, message, data || '');
        break;
      case 'warn':
        console.warn(`[${entry.timestamp}] WARN:`, message, data || '');
        break;
      case 'error':
        console.error(`[${entry.timestamp}] ERROR:`, message, data || '');
        break;
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }
}

export const logger = new Logger();
