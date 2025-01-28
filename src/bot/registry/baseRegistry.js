const Logger = require('../../utils/logger');

class BaseRegistry {
  constructor(type) {
    this.type = type;
    this.handlers = new Map();
  }

  /**
   * Register a handler with its class
   * @param {string} identifier - Handler identifier
   * @param {typeof import('../handlers/baseHandler')} HandlerClass - Handler class
   * @param {Object} metadata - Handler metadata
   */
  register(identifier, HandlerClass, metadata = {}) {
    if (this.handlers.has(identifier)) {
      Logger.warn(`${this.type} ${identifier} is already registered. Overwriting...`);
    }
    
    this.handlers.set(identifier, {
      HandlerClass,
      metadata: {
        [this.type.toLowerCase()]: identifier,
        description: metadata.description || '',
        ...metadata
      }
    });

    Logger.debug(`Registered ${this.type.toLowerCase()}: ${identifier}`, { metadata });
  }

  /**
   * Get all registered handlers
   * @returns {Map} Map of registered handlers
   */
  getAll() {
    return this.handlers;
  }

  /**
   * Get handler class and metadata
   * @param {string} identifier - Handler identifier
   * @returns {Object|null} Handler and metadata or null if not found
   */
  get(identifier) {
    return this.handlers.get(identifier) || null;
  }

  /**
   * Initialize all handlers for a bot instance
   * @param {Object} bot - Telegraf bot instance
   * @param {Object} config - Bot configuration (optional)
   */
  initialize(bot, config = {}) {
    for (const [identifier, { HandlerClass, metadata }] of this.handlers) {
      const handler = new HandlerClass(bot, config);
      handler.register(identifier);
      Logger.debug(`Initialized ${this.type.toLowerCase()} handler: ${identifier}`, { metadata });
    }
  }
}

module.exports = BaseRegistry;
