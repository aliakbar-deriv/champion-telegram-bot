const Logger = require('../logger');
const config = require('../../config');

// Mock config module
jest.mock('../../config');

describe('Logger', () => {
  // Store original console methods
  const originalConsole = { ...console };
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock console methods
    console.debug = jest.fn();
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    // Restore original console methods
    console.debug = originalConsole.debug;
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  describe('debug', () => {
    it('should log debug messages in development environment', () => {
      config.env = 'development';
      Logger.debug('test message', { detail: 'test' });

      expect(console.debug).toHaveBeenCalledWith(
        '[DEBUG]',
        'test message',
        { detail: 'test' }
      );
    });

    it('should not log debug messages in production environment', () => {
      config.env = 'production';
      Logger.debug('test message');

      expect(console.debug).not.toHaveBeenCalled();
    });

    it('should not log debug messages in staging environment', () => {
      config.env = 'staging';
      Logger.debug('test message');

      expect(console.debug).not.toHaveBeenCalled();
    });
  });

  describe('log', () => {
    it('should log messages in development environment', () => {
      config.env = 'development';
      Logger.log('test message', { detail: 'test' });

      expect(console.log).toHaveBeenCalledWith(
        '[INFO]',
        'test message',
        { detail: 'test' }
      );
    });

    it('should log messages in staging environment', () => {
      config.env = 'staging';
      Logger.log('test message');

      expect(console.log).toHaveBeenCalledWith(
        '[INFO]',
        'test message'
      );
    });

    it('should not log messages in production environment', () => {
      config.env = 'production';
      Logger.log('test message');

      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should log warnings in all environments', () => {
      const environments = ['development', 'staging', 'production'];

      environments.forEach(env => {
        config.env = env;
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
        config.env = env;
        console.error.mockClear();

        const error = new Error('test error');
        Logger.error('Error occurred:', error);

        expect(console.error).toHaveBeenCalledWith(
          '[ERROR]',
          `[${env}]`,
          'Error occurred:',
          error
        );
      });
    });

    it('should handle error objects with stack traces', () => {
      config.env = 'production';
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

  describe('edge cases', () => {
    it('should handle undefined environment', () => {
      config.env = undefined;
      
      // Should default to safe behavior (not logging debug/info)
      Logger.debug('test');
      Logger.log('test');
      expect(console.debug).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();

      // Should still log warnings and errors
      Logger.warn('test');
      Logger.error('test');
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle multiple arguments of different types', () => {
      config.env = 'development';
      const args = ['message', 123, { key: 'value' }, ['array']];
      
      Logger.debug(...args);
      expect(console.debug).toHaveBeenCalledWith('[DEBUG]', ...args);
      
      Logger.log(...args);
      expect(console.log).toHaveBeenCalledWith('[INFO]', ...args);
      
      Logger.warn(...args);
      expect(console.warn).toHaveBeenCalledWith('[WARN]', '[development]', ...args);
      
      Logger.error(...args);
      expect(console.error).toHaveBeenCalledWith('[ERROR]', '[development]', ...args);
    });
  });
});
