/**
 * Log levels enum
 * @readonly
 * @enum {number}
 */
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

/**
 * Centralized logging utility that provides environment-aware logging
 */
class Logger {
  static logLevel = process.env.LOG_LEVEL ? 
    LogLevel[process.env.LOG_LEVEL.toUpperCase()] : 
    (process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG);

  /**
   * Format a log message with timestamp and environment
   * @private
   */
  static formatMessage(level, args) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${process.env.NODE_ENV || 'development'}]`;
    
    return args.map(arg => {
      if (arg instanceof Error) {
        return {
          message: arg.message,
          stack: arg.stack,
          ...arg
        };
      }
      if (typeof arg === 'object') {
        return JSON.stringify(arg, null, 2);
      }
      return arg;
    }).join(' ');
  }

  /**
   * Development-only logging for technical details
   * Only visible in development environment and when log level is DEBUG
   */
  static debug(...args) {
    if (Logger.logLevel <= LogLevel.DEBUG) {
      console.debug(Logger.formatMessage('DEBUG', args));
    }
  }

  /**
   * Development/staging logging for general information
   * Not visible in production environment
   */
  static log(...args) {
    if (Logger.logLevel <= LogLevel.INFO) {
      console.log(Logger.formatMessage('INFO', args));
    }
  }

  /**
   * Warning logging for all environments
   * Visible when log level is WARN or lower
   */
  static warn(...args) {
    if (Logger.logLevel <= LogLevel.WARN) {
      console.warn(Logger.formatMessage('WARN', args));
    }
  }

  /**
   * Error logging for all environments
   * Always visible unless log level is NONE
   */
  static error(...args) {
    if (Logger.logLevel <= LogLevel.ERROR) {
      console.error(Logger.formatMessage('ERROR', args));
    }
  }

  /**
   * Get current log level
   * @returns {string} Current log level name
   */
  static getLogLevel() {
    return Object.keys(LogLevel).find(key => LogLevel[key] === Logger.logLevel);
  }

  /**
   * Set log level
   * @param {string} level - Log level name
   */
  static setLogLevel(level) {
    const newLevel = LogLevel[level.toUpperCase()];
    if (newLevel !== undefined) {
      Logger.logLevel = newLevel;
    } else {
      throw new Error(`Invalid log level: ${level}`);
    }
  }
}

module.exports = Logger;
