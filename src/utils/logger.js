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
  /**
   * Initialize the logger with default log level
   */
  static initialize() {
    Logger.logLevel = Logger.getCurrentLogLevel();
  }

  /**
   * Get the current log level based on environment
   * @private
   */
  static getCurrentLogLevel() {
    if (process.env.LOG_LEVEL) {
      const level = LogLevel[process.env.LOG_LEVEL.toUpperCase()];
      if (level !== undefined) {
        return level;
      }
    }
    
    switch (process.env.NODE_ENV) {
      case 'production':
        return LogLevel.WARN;
      case 'staging':
        return LogLevel.INFO;
      case 'development':
      default:
        return LogLevel.DEBUG;
    }
  }

  /**
   * Format a log message with timestamp and environment
   * @private
   */
  static formatMessage(level, args) {
    const prefix = `[${level}]`;
    const env = process.env.NODE_ENV || 'development';
    
    return [prefix, `[${env}]`, ...args.map(arg => {
      if (arg instanceof Error) {
        return {
          message: arg.message,
          stack: arg.stack,
          ...arg
        };
      }
      return arg;
    })];
  }

  /**
   * Development-only logging for technical details
   * Only visible in development environment and when log level is DEBUG
   */
  static debug(...args) {
    const env = process.env.NODE_ENV || 'development';
    if (env !== 'development') {
      return;
    }
    if (Logger.logLevel <= LogLevel.DEBUG) {
      console.debug(...Logger.formatMessage('DEBUG', args));
    }
  }

  /**
   * Development/staging logging for general information
   * Not visible in production environment
   */
  static log(...args) {
    const env = process.env.NODE_ENV || 'development';
    if (env === 'production') {
      return;
    }
    if (Logger.logLevel <= LogLevel.INFO) {
      console.log(...Logger.formatMessage('INFO', args));
    }
  }

  /**
   * Warning logging for all environments
   * Visible when log level is WARN or lower
   */
  static warn(...args) {
    if (Logger.logLevel <= LogLevel.WARN) {
      console.warn(...Logger.formatMessage('WARN', args));
    }
  }

  /**
   * Error logging for all environments
   * Always visible unless log level is NONE
   */
  static error(...args) {
    if (Logger.logLevel <= LogLevel.ERROR) {
      console.error(...Logger.formatMessage('ERROR', args));
    }
  }

  /**
   * Get current log level name
   * @returns {string} Current log level name
   */
  static getLogLevel() {
    return Object.keys(LogLevel).find(key => LogLevel[key] === Logger.logLevel) || 'DEBUG';
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

// Initialize logger with default log level
Logger.initialize();

module.exports = Logger;
