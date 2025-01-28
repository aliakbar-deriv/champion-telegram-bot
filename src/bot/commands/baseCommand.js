const BaseHandler = require('../handlers/baseHandler');

class BaseCommand extends BaseHandler {
  /**
   * Register command handler with the bot
   * @param {string} command - Command name without the slash
   */
  register(command) {
    this.bot.command(command, async (ctx) => {
      try {
        await this.handle(ctx);
      } catch (error) {
        await this.handleError(ctx, error, 'command');
      }
    });
  }
}

module.exports = BaseCommand;
