const BaseRegistry = require('../registry/baseRegistry');

class CommandRegistry extends BaseRegistry {
  constructor() {
    super('Command');
  }

  /**
   * Get menu commands for Telegram
   * @returns {Array} Array of command objects for Telegram menu
   */
  getMenuCommands() {
    return Array.from(this.handlers.values()).map(({ metadata }) => ({
      command: metadata.command,
      description: metadata.description
    }));
  }
}

// Create singleton instance
const commandRegistry = new CommandRegistry();

module.exports = commandRegistry;
