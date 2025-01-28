const Logger = require('../logger');
const config = require('../../config');

// Mock config module
jest.mock('../../config');

describe('Logger', () => {
  // Store original console methods
  const originalConsole = { ...console };
  const originalEnv = { ...process.env };
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock console methods
    console.debug = jest.fn();
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();

    // Reset environment
    process.env = { ...originalEnv };
    delete process.env.NODE_ENV;
    delete process.env.LOG_LEVEL;
    
    // Reinitialize logger
    Logger.initialize();
  });

  afterEach(() => {
    // Restore original console methods
    console.debug = originalConsole.debug;
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    
    // Restore original env
    process.env = { ...originalEnv };
  });

  describe('debug', () => {
    it('should log debug messages in development environment', () => {
      process.env.NODE_ENV = 'development';
      Logger.initialize();
      Logger.debug('test message', { detail: 'test' });

      expect(console.debug).toHaveBeenCalledWith(
        '[DEBUG]',
        '[development]',
        'test message',
        { detail: 'test' }
      );
    });

    it('should not log debug messages in production environment', () => {
      process.env.NODE_ENV = 'production';
      Logger.initialize();
      Logger.debug('test message');

      expect(console.debug).not.toHaveBeenCalled();
    });

    it('should not log debug messages in staging environment', () => {
      process.env.NODE_ENV = 'staging';
      Logger.initialize();
      Logger.debug('test message');

      expect(console.debug).not.toHaveBeenCalled();
    });
  });

  describe('log', () => {
    it('should log messages in development environment', () => {
      process.env.NODE_ENV = 'development';
      Logger.initialize();
      Logger.log('test message', { detail: 'test' });

      expect(console.log).toHaveBeenCalledWith(
        '[INFO]',
        '[development]',
        'test message',
        { detail: 'test' }
      );
    });

    it('should log messages in staging environment', () => {
      process.env.NODE_ENV = 'staging';
      Logger.initialize();
      Logger.log('test message');

      expect(console.log).toHaveBeenCalledWith(
        '[INFO]',
        '[staging]',
        'test message'
      );
    });

    it('should not log messages in production environment', () => {
      process.env.NODE_ENV = 'production';
      Logger.initialize();
      Logger.log('test message');

      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should log warnings in all environments', () => {
      const environments = ['development', 'staging', 'production'];

      environments.forEach(env => {
        process.env.NODE_ENV = env;
        Logger.initialize();
        console.warn.mockClear();

        Logger.warn('test warning', { detail: 'test' });

        expect(console.warn).toHaveBeenCalledWith(
          '[WARN]',
          `[${env}]`,
          'test warning',
          { detail: 'test' }
        );
      });
    });
  });

  describe('error', () => {
    it('should log errors in all environments', () => {
      const environments = ['development', 'staging', 'production'];

      environments.forEach(env => {
        process.env.NODE_ENV = env;
        Logger.initialize();
        console.error.mockClear();

        const error = new Error('test error');
        Logger.error('Error occurred:', error);

        expect(console.error).toHaveBeenCalledWith(
          '[ERROR]',
          `[${env}]`,
          'Error occurred:',
          {
            message: error.message,
            stack: error.stack,
            ...error
          }
        );
      });
    });

    it('should handle error objects with stack traces', () => {
      process.env.NODE_ENV = 'production';
      Logger.initialize();
      const error = new Error('test error');
      Logger.error('Error:', { error, stack: error.stack });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR]',
        '[production]',
        'Error:',
        { error, stack: error.stack }
      );
    });
  });

  describe('log level control', () => {
    it('should respect LOG_LEVEL environment variable', () => {
      process.env.NODE_ENV = 'development';
      process.env.LOG_LEVEL = 'ERROR';
      
      // Reinitialize logger to pick up new log level
      Logger.initialize();

      Logger.debug('test debug');
      Logger.log('test info');
      Logger.warn('test warn');
      Logger.error('test error');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it('should allow setting log level programmatically', () => {
      process.env.NODE_ENV = 'development';
      Logger.initialize();
      Logger.setLogLevel('WARN');

      Logger.debug('test debug');
      Logger.log('test info');
      Logger.warn('test warn');
      Logger.error('test error');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it('should throw error for invalid log level', () => {
      expect(() => Logger.setLogLevel('INVALID')).toThrow('Invalid log level: INVALID');
    });

    it('should correctly report current log level', () => {
      Logger.setLogLevel('WARN');
      expect(Logger.getLogLevel()).toBe('WARN');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined environment', () => {
      delete process.env.NODE_ENV;
      Logger.initialize();
      
      // Should default to development behavior
      Logger.debug('test');
      Logger.log('test');
      Logger.warn('test');
      Logger.error('test');

      expect(console.debug).toHaveBeenCalledWith('[DEBUG]', '[development]', 'test');
      expect(console.log).toHaveBeenCalledWith('[INFO]', '[development]', 'test');
      expect(console.warn).toHaveBeenCalledWith('[WARN]', '[development]', 'test');
      expect(console.error).toHaveBeenCalledWith('[ERROR]', '[development]', 'test');
    });

    it('should handle multiple arguments of different types', () => {
      process.env.NODE_ENV = 'development';
      Logger.initialize();
      const args = ['message', 123, { key: 'value' }, ['array']];
      
      Logger.debug(...args);
      expect(console.debug).toHaveBeenCalledWith('[DEBUG]', '[development]', ...args);
    });
  });
});
