const BaseCommand = require('./baseCommand');
const { MessageTemplates } = require('../../constants');
const config = require('../../config');
const Logger = require('../../utils/logger');
const { formatMessage } = require('../../utils/messageFormatter');

class StartCommand extends BaseCommand {
  async handle(ctx) {
    try {
      await ctx.replyWithPhoto(
        'https://imgur.com/pezy5zb',
        {
          caption: formatMessage(MessageTemplates.WELCOME, {
              WEB_APP_URL: config.bot.webAppUrl
          }),
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Trade Now! 📈', web_app: { url: config.bot.webAppHostUrl } }],
              [{ text: 'About', callback_data: 'about' }, { text: 'Explore More 🌟', url: config.urls.learnMore }]
            ]
          },
          parse_mode: 'HTML',
          link_preview_options: {
            is_disabled: false,
            url: config.urls.learnMore,
            prefer_small_media: true
          }
        }
      );

      Logger.debug('New user started bot:', {
        user: this.getUserInfo(ctx),
        timestamp: new Date().toISOString(),
        messageTemplate: 'WELCOME',
        webAppUrl: config.bot.webAppUrl,
        webAppHostUrl: config.bot.webAppHostUrl,
        learnMoreUrl: config.urls.learnMore
      });
    } catch (error) {
      await this.handleError(ctx, error, 'command');
    }
  }
}

module.exports = StartCommand;
