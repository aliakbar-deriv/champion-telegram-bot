const crypto = require('crypto');
const Logger = require('../../utils/logger');

class WebAppValidator {
  constructor(botToken, config) {
    this.botToken = botToken;
    this.config = config;
  }

  /**
   * Validates web app data using Telegram's data validation algorithm
   * @param {string} initData - Raw init data string from Telegram
   * @returns {boolean} - Whether the data is valid
   */
  validateWebAppData(initData) {
    try {
      // Parse the data
      const data = Object.fromEntries(new URLSearchParams(initData));
      
      if (!data.hash) {
        Logger.warn('Web app data validation failed: Missing hash', { 
          data,
          webAppUrl: this.config.bot.webAppUrl,
          webAppHostUrl: this.config.bot.webAppHostUrl
        });
        return false;
      }

      // Remove hash from data object before checking
      const hash = data.hash;
      delete data.hash;

      // Create check string
      const checkString = Object.keys(data)
        .sort()
        .map(key => `${key}=${data[key]}`)
        .join('\n');

      // Calculate secret key using bot token
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(this.botToken)
        .digest();

      // Calculate data hash
      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(checkString)
        .digest('hex');

      const isValid = calculatedHash === hash;
      if (!isValid) {
        Logger.warn('Web app data validation failed: Hash mismatch', {
          expectedHash: hash,
          calculatedHash,
          webAppUrl: this.config.bot.webAppUrl,
          webAppHostUrl: this.config.bot.webAppHostUrl
        });
      }

      return isValid;
    } catch (error) {
      Logger.error('Web app data validation error:', {
        error: error.message,
        stack: error.stack,
        initData,
        webAppUrl: this.config.bot.webAppUrl,
        webAppHostUrl: this.config.bot.webAppHostUrl
      });
      return false;
    }
  }

  /**
   * Validates trade data structure and values
   * @param {Object} data - Trade data object
   * @returns {Object} - Validation result
   */
  validateTradeData(data) {
    const errors = [];

    // Required fields
    const requiredFields = ['symbol', 'amount', 'action'];
    for (const field of requiredFields) {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Amount validation
    if (data.amount && (!Number.isFinite(Number(data.amount)) || Number(data.amount) <= 0)) {
      errors.push('Invalid amount: must be a positive number');
    }

    // Symbol validation (basic example - expand based on your requirements)
    if (data.symbol && typeof data.symbol !== 'string') {
      errors.push('Invalid symbol format');
    }

    // Action validation
    const validActions = ['buy', 'sell'];
    if (data.action && !validActions.includes(data.action.toLowerCase())) {
      errors.push('Invalid action: must be buy or sell');
    }

    if (errors.length > 0) {
      Logger.warn('Trade data validation failed:', {
        errors,
        data,
        webAppUrl: this.config.bot.webAppUrl,
        webAppHostUrl: this.config.bot.webAppHostUrl
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = WebAppValidator;
