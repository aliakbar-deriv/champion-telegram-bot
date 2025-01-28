const BaseCommand = require('./baseCommand');
const { MessageTemplates } = require('../../constants');
const Logger = require('../../utils/logger');
const config = require('../../config');

class TradeCommand extends BaseCommand {
  async handle(ctx) {
    try {
      const keyboard = {
        inline_keyboard: [[
          {
            text: 'Open app',
            web_app: { url: config.bot.webAppHostUrl }
          }
        ]]
      };

      await ctx.reply(MessageTemplates.TRADE_PROMPT, { reply_markup: keyboard });
      
      Logger.debug('User accessed trade command:', {
        user: this.getUserInfo(ctx),
        timestamp: new Date().toISOString(),
        messageTemplate: 'TRADE_PROMPT',
        command: 'trade'
      });
    } catch (error) {
      await this.handleError(ctx, error);
    }
  }
}

module.exports = TradeCommand;
