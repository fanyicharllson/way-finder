/**
 * Environment-aware logger utility
 * 
 * - Development: Shows detailed logs with all data
 * - Production: Shows sanitized logs without sensitive information
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

interface SanitizedData {
  [key: string]: any;
}

/**
 * Sanitize sensitive data for production logging
 */
function sanitizeData(data: any): SanitizedData {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized: SanitizedData = Array.isArray(data) ? [] : {};
  const sensitiveKeys = ['email', 'password', 'token', 'userId', 'preferences', 'user'];

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Logger class for environment-aware logging
 */
export class Logger {
  /**
   * Development-only detailed logging
   */
  static dev(message: string, data?: any): void {
    if (isDevelopment) {
      if (data !== undefined) {
        console.log(message, data);
      } else {
        console.log(message);
      }
    }
  }

  /**
   * Info logging - shows in both dev and prod (sanitized in prod)
   */
  static info(message: string, data?: any): void {
    if (isDevelopment) {
      if (data !== undefined) {
        console.log(message, data);
      } else {
        console.log(message);
      }
    } else {
      // Production: sanitize data
      if (data !== undefined) {
        console.log(message, sanitizeData(data));
      } else {
        console.log(message);
      }
    }
  }

  /**
   * Error logging - always shown with full details for debugging
   */
  static error(message: string, error?: any): void {
    if (error !== undefined) {
      console.error(message, error);
    } else {
      console.error(message);
    }
  }

  /**
   * Warning logging - always shown
   */
  static warn(message: string, data?: any): void {
    if (data !== undefined) {
      console.warn(message, data);
    } else {
      console.warn(message);
    }
  }

  /**
   * Event logging - dev only, completely silent in production
   */
  static event(event: string, data?: any): void {
    if (isDevelopment) {
      if (data !== undefined) {
        console.log(`📡 Event emitted: ${event}`, data);
      } else {
        console.log(`📡 Event emitted: ${event}`);
      }
    }
  }

  /**
   * Auth logging - simple message in prod, detailed in dev
   */
  static auth(message: string, identifier?: string): void {
    if (isDevelopment) {
      console.log(`🔐 ${message}${identifier ? ': ' + identifier : ''}`);
    } else {
      console.log(`🔐 ${message}`);
    }
  }

  /**
   * Success logging - simple messages only
   */
  static success(message: string): void {
    console.log(`✅ ${message}`);
  }
}
