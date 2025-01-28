const Logger = require('../../utils/logger');

/**
 * Base handler class that all command and action handlers should extend
 */
class BaseHandler {
  constructor(bot) {
    this.bot = bot;
  }

  /**
   * Register handler with the bot - to be implemented by child classes
   * @param {string} identifier - Handler identifier
   */
  register(identifier) {
    throw new Error('Handler must implement register method');
  }

  /**
   * Handle the event - to be implemented by child classes
   * @param {Object} ctx - Telegram context
   */
  async handle(_ctx) {
    const type = this.constructor.name.includes('Command') ? 'Command' : 
                 this.constructor.name.includes('Action') ? 'Action' : 'Base';
    throw new Error(`${type} handler must implement handle method`);
  }

  /**
   * Helper method to get user information
   * @param {Object} ctx - Telegram context
   * @returns {Object} User info
   */
  getUserInfo(ctx) {
    const user = ctx.from;
    return {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      languageCode: user.language_code
    };
  }

  /**
   * Helper method to handle errors
   * @param {Object} ctx - Telegram context
   * @param {Error} error - Error object
   * @param {string} type - Error type (command/action)
   */
  async handleError(ctx, error, type) {
    const errorContext = {
      user: this.getUserInfo(ctx),
      error: {
        message: error.message,
        stack: error.stack
      }
    };

    if (type === 'command') {
      errorContext.command = ctx.message.text;
    } else if (type === 'action') {
      errorContext.action = ctx.callbackQuery?.data;
    }

    Logger.error(`${type} error: ${error.message}`, errorContext);
    await ctx.reply('Sorry, there was an error processing your request. Please try again.');
  }
}

module.exports = BaseHandler;
