const BaseCommand = require('./baseCommand');
const { MessageTemplates } = require('../../constants');
const config = require('../../config');
const Logger = require('../../utils/logger');

class HelpCommand extends BaseCommand {
  async handle(ctx) {
    try {
      await ctx.reply(
        MessageTemplates.HELP_GUIDE,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Support 🌟', url: config.urls.support }]
            ]
          },
          parse_mode: 'HTML'
        }
      );

      Logger.debug('User requested help:', {
        user: this.getUserInfo(ctx),
        timestamp: new Date().toISOString(),
        messageTemplate: 'HELP_GUIDE',
        supportUrl: config.urls.support
      });
    } catch (error) {
      await this.handleError(ctx, error);
    }
  }
}

module.exports = HelpCommand;
