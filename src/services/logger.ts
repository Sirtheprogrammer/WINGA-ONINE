/**
 * Firebase Service Logger
 * Centralized logging utility for Firebase operations
 * Logs errors with context, timestamps, and relevant information
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  operation: string;
  message: string;
  error?: {
    code?: string;
    message: string;
    stack?: string;
  };
  context?: Record<string, unknown>;
}

class FirebaseLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs in memory

  /**
   * Log an entry
   */
  private log(level: LogLevel, service: string, operation: string, message: string, error?: Error, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service,
      operation,
      message,
      error: error ? {
        code: (error as any).code,
        message: error.message,
        stack: error.stack
      } : undefined,
      context
    };

    this.logs.push(entry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Output to console with appropriate level
    // Use simple, visible logging that works in all browsers
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] [${level}] [${service}] [${operation}] ${message}`;
    
    // Format context and error for better readability
    const contextObj = context || {};
    const errorInfo = error ? {
      message: error.message,
      code: (error as any).code,
      stack: error.stack
    } : null;
    
    // Log with appropriate console method and styling
    switch (level) {
      case LogLevel.ERROR:
        console.error(`%c❌ ${logMessage}`, 'color: red; font-weight: bold;', {
          error: errorInfo,
          context: contextObj
        });
        break;
      case LogLevel.WARN:
        console.warn(`%c⚠️ ${logMessage}`, 'color: orange; font-weight: bold;', contextObj);
        break;
      case LogLevel.INFO:
        console.log(`%cℹ️ ${logMessage}`, 'color: #0066cc; font-weight: bold;', contextObj);
        break;
      case LogLevel.DEBUG:
        console.log(`%c🔍 ${logMessage}`, 'color: #666;', contextObj);
        break;
    }
  }

  /**
   * Log an error
   */
  error(service: string, operation: string, message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, service, operation, message, error, context);
  }

  /**
   * Log a warning
   */
  warn(service: string, operation: string, message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, service, operation, message, undefined, context);
  }

  /**
   * Log an info message
   */
  info(service: string, operation: string, message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, service, operation, message, undefined, context);
  }

  /**
   * Log a debug message
   */
  debug(service: string, operation: string, message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, service, operation, message, undefined, context);
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by service
   */
  getLogsByService(service: string): LogEntry[] {
    return this.logs.filter(log => log.service === service);
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Get error logs only
   */
  getErrorLogs(): LogEntry[] {
    return this.getLogsByLevel(LogLevel.ERROR);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Export singleton instance
export const firebaseLogger = new FirebaseLogger();

// Export convenience functions for common services
export const authLogger = {
  error: (operation: string, message: string, error?: Error, context?: Record<string, unknown>) => 
    firebaseLogger.error('AUTH', operation, message, error, context),
  warn: (operation: string, message: string, context?: Record<string, unknown>) => 
    firebaseLogger.warn('AUTH', operation, message, context),
  info: (operation: string, message: string, context?: Record<string, unknown>) => 
    firebaseLogger.info('AUTH', operation, message, context),
  debug: (operation: string, message: string, context?: Record<string, unknown>) => 
    firebaseLogger.debug('AUTH', operation, message, context)
};

export const productsLogger = {
  error: (operation: string, message: string, error?: Error, context?: Record<string, unknown>) => 
    firebaseLogger.error('PRODUCTS', operation, message, error, context),
  warn: (operation: string, message: string, context?: Record<string, unknown>) => 
    firebaseLogger.warn('PRODUCTS', operation, message, context),
  info: (operation: string, message: string, context?: Record<string, unknown>) => 
    firebaseLogger.info('PRODUCTS', operation, message, context),
  debug: (operation: string, message: string, context?: Record<string, unknown>) => 
    firebaseLogger.debug('PRODUCTS', operation, message, context)
};

export const firebaseLoggerUtil = {
  error: (operation: string, message: string, error?: Error, context?: Record<string, unknown>) => 
    firebaseLogger.error('FIREBASE', operation, message, error, context),
  warn: (operation: string, message: string, context?: Record<string, unknown>) => 
    firebaseLogger.warn('FIREBASE', operation, message, context),
  info: (operation: string, message: string, context?: Record<string, unknown>) => 
    firebaseLogger.info('FIREBASE', operation, message, context),
  debug: (operation: string, message: string, context?: Record<string, unknown>) => 
    firebaseLogger.debug('FIREBASE', operation, message, context)
};

