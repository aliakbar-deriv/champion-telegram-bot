const { Telegraf } = require("telegraf");
const config = require("../config");
const Logger = require("../utils/logger");
const commandRegistry = require("./commands/commandRegistry");
const actionRegistry = require("./actions/actionRegistry");

// Import handlers
const StartCommand = require("./commands/startCommand");
const TradeCommand = require("./commands/tradeCommand");
const HelpCommand = require("./commands/helpCommand");
const AboutAction = require("./actions/aboutAction");
const WebAppDataHandler = require("./actions/webAppDataHandler");

class ChampionBot {
  constructor() {
    this.bot = new Telegraf(config.bot.token, {
      telegram: {
        menuButton: {
          type: "web_app",
          text: "Open App",
          web_app: { url: config.bot.webAppHostUrl }
        }
      }
    });
    this.initializeHandlers();
  }

  /**
   * Initialize all handlers
   */
  initializeHandlers() {
    // Register commands
    commandRegistry.register("start", StartCommand, {
      description: "Start the bot",
      usage: "/start"
    });

    commandRegistry.register("trade", TradeCommand, {
      description: "Open trading interface",
      usage: "/trade"
    });

    commandRegistry.register("help", HelpCommand, {
      description: "Show help information",
      usage: "/help"
    });

    // Register actions
    actionRegistry.register("about", AboutAction, {
      description: "About Champion Trade",
      type: "button"
    });

    actionRegistry.register("webapp_data", WebAppDataHandler, {
      description: "Handle web app data",
      type: "webapp"
    });

    // Initialize handlers
    commandRegistry.initialize(this.bot);
    actionRegistry.initialize(this.bot, config);

    // Set up error handling
    this.setupErrorHandler();
  }

  /**
   * Configure bot menu commands and button
   */
  async configureBotCommands() {
    const menuCommands = commandRegistry.getMenuCommands();
    try {
      await this.bot.telegram.setMyCommands(menuCommands);
      Logger.debug("Bot commands configured", {
        commands: menuCommands
      });
    } catch (error) {
      Logger.error("Failed to configure bot commands:", {
        error: error.message,
        stack: error.stack,
        commands: menuCommands
      });
      throw error;
    }
  }

  /**
   * Set up global error handler
   */
  setupErrorHandler() {
    this.bot.catch((err, ctx) => {
      const errorContext = {
        error: err.message,
        stack: err.stack,
        user: ctx?.from,
        update: ctx?.update,
        updateType: ctx?.updateType
      };

      Logger.error("Unhandled bot error:", errorContext);
      ctx?.reply("An error occurred. Please try again later.");
    });
  }

  /**
   * Launch the bot
   */
  async launch() {
    try {
      // Launch bot first, then configure commands
      await this.bot.launch();
      await this.configureBotCommands();

      Logger.log("Champion Bot is running", {
        env: config.env,
        webAppUrl: config.bot.webAppUrl,
        webAppHostUrl: config.bot.webAppHostUrl
      });

      // Enable graceful stop
      process.once("SIGINT", () => this.stop("SIGINT"));
      process.once("SIGTERM", () => this.stop("SIGTERM"));
    } catch (error) {
      Logger.error("Failed to launch bot:", {
        error: error.message,
        stack: error.stack,
        env: config.env
      });
      throw error;
    }
  }

  /**
   * Stop the bot
   * @param {string} signal - Signal that triggered the stop
   */
  async stop(signal) {
    Logger.warn(`Stopping bot due to ${signal}`, {
      env: config.env,
      timestamp: new Date().toISOString()
    });
    await this.bot.stop(signal);
  }
}

module.exports = ChampionBot;
