// Production-ready logging utility
interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private createLogEntry(level: string, message: string, context?: Record<string, unknown>, error?: Error): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };
  }

  private shouldLog(level: string): boolean {
    // In production, only log warnings and errors
    if (!this.isDevelopment) {
      return level === LOG_LEVELS.WARN || level === LOG_LEVELS.ERROR;
    }
    return true;
  }

  private sendToProdLogging(logEntry: LogEntry): void {
    // In production, this would send to a logging service like:
    // - Sentry for error tracking
    // - LogRocket for user session replay
    // - CloudWatch/DataDog for application monitoring
    
    if (!this.isDevelopment) {
      // Example: Send to external logging service
      // await fetch('/api/logs', { method: 'POST', body: JSON.stringify(logEntry) });
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
    
    const logEntry = this.createLogEntry(LOG_LEVELS.DEBUG, message, context);
    
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context);
    }
    
    this.sendToProdLogging(logEntry);
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    
    const logEntry = this.createLogEntry(LOG_LEVELS.INFO, message, context);
    
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context);
    }
    
    this.sendToProdLogging(logEntry);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LOG_LEVELS.WARN)) return;
    
    const logEntry = this.createLogEntry(LOG_LEVELS.WARN, message, context);
    
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context);
    }
    
    this.sendToProdLogging(logEntry);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LOG_LEVELS.ERROR)) return;
    
    const logEntry = this.createLogEntry(LOG_LEVELS.ERROR, message, context, error);
    
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context);
    }
    
    this.sendToProdLogging(logEntry);
  }

  // Security event logging
  securityEvent(event: string, context?: Record<string, unknown>): void {
    const message = `Security Event: ${event}`;
    const logEntry = this.createLogEntry(LOG_LEVELS.WARN, message, {
      ...context,
      securityEvent: true,
    });
    
    if (this.isDevelopment) {
      console.warn(`[SECURITY] ${message}`, context);
    }
    
    this.sendToProdLogging(logEntry);
  }
}

export const logger = new Logger();