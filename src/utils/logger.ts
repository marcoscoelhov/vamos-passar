
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private enabledLevels: LogLevel[] = this.isDevelopment 
    ? ['debug', 'info', 'warn', 'error']
    : ['warn', 'error'];

  private formatMessage(level: LogLevel, message: string, data?: any): void {
    if (!this.enabledLevels.includes(level)) return;

    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = { level, message, timestamp, data };

    const style = this.getLogStyle(level);
    
    if (data) {
      console[level](`%c[${level.toUpperCase()}] ${message}`, style, data);
    } else {
      console[level](`%c[${level.toUpperCase()}] ${message}`, style);
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

  debug(message: string, data?: any): void {
    this.formatMessage('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.formatMessage('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.formatMessage('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.formatMessage('error', message, data);
  }
}

export const logger = new Logger();
