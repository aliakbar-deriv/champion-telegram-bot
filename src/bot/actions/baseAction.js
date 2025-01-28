const BaseHandler = require('../handlers/baseHandler');
const Logger = require('../../utils/logger');

class BaseAction extends BaseHandler {
  /**
   * Register action handler with the bot
   * @param {string|RegExp} trigger - Action trigger pattern
   */
  register(trigger) {
    this.bot.action(trigger, async (ctx) => {
      try {
        await this.handle(ctx);
        await this.answerCallback(ctx);
      } catch (error) {
        await this.handleError(ctx, error, 'action');
      }
    });
  }

  /**
   * Helper method to answer callback query and handle errors
   * @param {Object} ctx - Telegram context
   */
  async answerCallback(ctx) {
    try {
      await ctx.answerCbQuery();
    } catch (error) {
      Logger.error('Error answering callback query:', {
        error,
        stack: error.stack,
        user: this.getUserInfo(ctx),
        callbackQuery: ctx.callbackQuery?.data
      });
    }
  }
}

module.exports = BaseAction;
