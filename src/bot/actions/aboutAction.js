const BaseAction = require('./baseAction');
const { MessageTemplates, BotActionTypes } = require('../../constants');
const Logger = require('../../utils/logger');
const config = require('../../config');

class AboutAction extends BaseAction {
  async handle(ctx) {
    try {
      await this.answerCallback(ctx);
      
      const keyboard = {
        inline_keyboard: [[
          {
            text: 'Start trading',
            web_app: { url: config.bot.webAppHostUrl }
          }
        ]]
      };

      await ctx.reply(MessageTemplates.ABOUT, { reply_markup: keyboard });

      Logger.debug('User viewed about info:', {
        user: this.getUserInfo(ctx),
        timestamp: new Date().toISOString(),
        actionType: BotActionTypes.ABOUT,
        messageTemplate: 'ABOUT',
        webAppHostUrl: config.bot.webAppHostUrl
      });
    } catch (error) {
      await this.handleError(ctx, error);
    }
  }
}

module.exports = AboutAction;
