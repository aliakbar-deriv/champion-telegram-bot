const ChampionBot = require('./bot/ChampionBot');
const Logger = require('./utils/logger');
const config = require('./config');

/**
 * Setup process event handlers
 * @param {ChampionBot} bot - Bot instance
 */
function setupProcessHandlers(bot) {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    Logger.error('Uncaught exception:', error);
    cleanup(bot, 'UNCAUGHT_EXCEPTION');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled rejection:', { reason, promise });
    cleanup(bot, 'UNHANDLED_REJECTION');
  });

  // Handle system signals
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.once(signal, () => cleanup(bot, signal));
  });
}

/**
 * Cleanup and exit
 * @param {ChampionBot} bot - Bot instance
 * @param {string} reason - Reason for cleanup
 */
async function cleanup(bot, reason) {
  Logger.warn(`Initiating cleanup due to ${reason}`, {
    env: config.env,
    timestamp: new Date().toISOString()
  });

  try {
    if (bot) {
      await bot.stop(reason);
    }
  } catch (error) {
    Logger.error('Error during cleanup:', error);
  }

  // Exit with error code if cleanup was due to an error
  const exitCode = ['UNCAUGHT_EXCEPTION', 'UNHANDLED_REJECTION'].includes(reason) ? 1 : 0;
  process.exit(exitCode);
}

/**
 * Main application entry point
 */
async function main() {
  let bot;
  try {
    Logger.log('Starting Champion Trade Bot...', {
      env: config.env,
      logLevel: Logger.getLogLevel()
    });

    bot = new ChampionBot();
    setupProcessHandlers(bot);
    await bot.launch();

    Logger.log('Bot startup complete', {
      env: config.env,
      webAppUrl: config.bot.webAppUrl,
      webAppHostUrl: config.bot.webAppHostUrl
    });
  } catch (error) {
    Logger.error('Failed to start bot:', error);
    await cleanup(bot, 'STARTUP_ERROR');
  }
}

// Start the application
main();
