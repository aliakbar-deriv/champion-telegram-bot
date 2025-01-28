const { WebAppDataTypes, MessageTemplates } = require('../../constants');
const WebAppValidator = require('../../services/validation/webAppValidator');
const TradeService = require('../../services/trade/tradeService');
const Logger = require('../../utils/logger');

class WebAppDataHandler {
  constructor(bot, config) {
    this.bot = bot;
    this.config = config;
    this.validator = new WebAppValidator(config.bot.token, config);
    this.tradeService = new TradeService();
  }

  /**
   * Register web app data handler with the bot
   */
  register() {
    this.bot.on('web_app_data', this.handle.bind(this));
  }

  /**
   * Handle web app data
   * @param {Object} ctx - Telegram context
   */
  async handle(ctx) {
    try {
      // Validate web app data
      if (!this.validator.validateWebAppData(ctx.webAppInitData)) {
        throw new Error(MessageTemplates.ERROR.INVALID_DATA);
      }

      const data = JSON.parse(ctx.webAppData.data.data);
      
      switch (data.type) {
        case WebAppDataTypes.TRADE:
          await this.handleTradeData(ctx, data);
          break;
        case WebAppDataTypes.ERROR:
          await this.handleErrorData(ctx, data);
          break;
        default:
          await ctx.reply('Received unknown data type from web app');
      }
    } catch (error) {
      await this.handleError(ctx, error);
    }
  }

  /**
   * Handle trade data from web app
   * @param {Object} ctx - Telegram context
   * @param {Object} data - Trade data
   */
  async handleTradeData(ctx, data) {
    try {
      // Validate trade data structure
      const validationResult = this.validator.validateTradeData(data);
      if (!validationResult.isValid) {
        throw new Error(`Invalid trade data: ${validationResult.errors.join(', ')}`);
      }

      // Process trade
      const result = await this.tradeService.processTrade(data, ctx.from.id);
      await ctx.reply(result.message);

    } catch (error) {
      Logger.error('Trade handling error:', {
        error: error.message,
        stack: error.stack,
        userId: ctx.from.id,
        data
      });
      await ctx.reply(MessageTemplates.ERROR.TRADE_PROCESSING);
    }
  }

  /**
   * Handle error data from web app
   * @param {Object} ctx - Telegram context
   * @param {Object} data - Error data
   */
  async handleErrorData(ctx, data) {
    Logger.error('Web app error:', {
      message: data.message,
      userId: ctx.from.id,
      data
    });
    await ctx.reply(
      `❌ Error in web app:\n${data.message}\n\nPlease try again or contact support if the issue persists.`
    );
  }

  /**
   * Handle errors
   * @param {Object} ctx - Telegram context
   * @param {Error} error - Error object
   */
  async handleError(ctx, error) {
    Logger.error('Web app data error:', {
      error: error.message,
      stack: error.stack,
      userId: ctx.from.id,
      webAppData: ctx.webAppData,
      webAppUrl: this.config.bot.webAppUrl,
      webAppHostUrl: this.config.bot.webAppHostUrl
    });
    await ctx.reply(MessageTemplates.ERROR.WEB_APP);
  }

  /**
   * Get user information
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
}

module.exports = WebAppDataHandler;
