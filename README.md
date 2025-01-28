# Champion Trade Telegram Bot

This is the Telegram bot for Champion Trade platform. It handles user interactions and provides access to the trading mini app.

## Features

### Core Features
- Menu button "Trade" that opens the mini app
- Welcome message with trading platform access
- About information for Champion Trade
- Direct link to Champion Trade website

### Technical Features
- Registry-based command and action management
- Automated menu command generation
- Extensible architecture for adding new commands/actions
- Comprehensive error handling and logging
- Test coverage for components

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Update `.env` with your configuration:
   - `BOT_TOKEN`: Your Telegram bot token from [@BotFather](https://t.me/BotFather)
   - `WEBAPP_URL`: The official Telegram Mini App URL (t.me URL) used for direct links and sharing
   - `WEBAPP_HOST_URL`: The actual hosting URL where your web application is deployed
   - `NODE_ENV`: Set to 'development' for local development

5. Start development server:
   ```bash
   npm run dev
   ```

## Production Deployment

### Option 1: Traditional Hosting

1. Set up your production environment (e.g., VPS, cloud server)
2. Clone the repository
3. Install dependencies:
   ```bash
   npm install --production
   ```
4. Set up environment variables:
   - Create `.env` file or set system environment variables
   - Set `NODE_ENV=production`
   - Configure production `WEBAPP_URL` (t.me URL)
   - Configure production `WEBAPP_HOST_URL` (hosting URL)
   - Set production `BOT_TOKEN`

5. Start the bot:
   ```bash
   npm start
   ```

### Option 2: Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t champion-telegram-bot .
   ```

2. Run the container:
   ```bash
   docker run -d \
     --name champion-bot \
     -e BOT_TOKEN=your_token \
     -e WEBAPP_URL=your_telegram_webapp_url \
     -e WEBAPP_HOST_URL=your_hosting_url \
     -e NODE_ENV=production \
     champion-telegram-bot
   ```

### Option 3: Serverless Deployment

The bot can also be deployed to serverless platforms like:
- AWS Lambda
- Google Cloud Functions
- Vercel
- Heroku

Choose the platform that best fits your needs and follow their specific deployment guidelines.

## Project Structure

```
champion-telegram-bot/
├── src/
│   ├── index.js                    # Application entry point
│   ├── bot/
│   │   ├── ChampionBot.js         # Main bot implementation
│   │   ├── commands/
│   │   │   ├── commandRegistry.js # Command management system
│   │   │   ├── baseCommand.js     # Base command class
│   │   │   ├── startCommand.js    # Start command implementation
│   │   │   ├── tradeCommand.js    # Trade command implementation
│   │   │   ├── helpCommand.js     # Help command implementation
│   │   │   └── __tests__/        # Command tests
│   │   ├── actions/
│   │   │   ├── actionRegistry.js  # Action management system
│   │   │   ├── baseAction.js      # Base action class
│   │   │   ├── aboutAction.js     # About action implementation
│   │   │   ├── webAppDataHandler.js # Web app data handler
│   │   │   └── __tests__/        # Action tests
│   │   └── middleware/           # Bot middleware
│   ├── config/                   # Configuration management
│   ├── constants/                # Application constants
│   ├── errors/                   # Error definitions
│   ├── services/
│   │   ├── trade/               # Trading service
│   │   └── validation/          # Validation service
│   ├── types/                   # Type definitions
│   └── utils/
│       ├── logger.js            # Logging utility
│       └── __tests__/          # Utility tests
├── .env.example                 # Environment variables template
├── package.json                # Project dependencies and scripts
└── README.md                   # Project documentation
```

## Architecture

### Command and Action System

The bot uses registry patterns for managing both Telegram commands and actions. This architecture provides:
- Centralized command management
- Automatic menu command generation
- Metadata support for each command
- Easy command registration and initialization

### Command System

The command system is built on three main components:

1. **BaseCommand**: Abstract base class providing:
   - Error handling
   - User info extraction
   - Common command utilities

2. **CommandRegistry**: Central command management:
   - Command registration and initialization
   - Menu command generation
   - Metadata management

3. **Individual Commands**:
   - Extend BaseCommand
   - Implement specific command logic
   - Include command-specific error handling

### Action System

The action system mirrors the command system structure:

1. **BaseAction**: Abstract base class providing:
   - Error handling
   - User info extraction
   - Callback query handling

2. **ActionRegistry**: Central action management:
   - Action registration and initialization
   - Metadata management
   - Action type categorization

3. **Individual Actions**:
   - Extend BaseAction
   - Implement specific action logic
   - Include action-specific error handling

### Adding New Commands

```javascript
const BaseCommand = require('./baseCommand');

class NewCommand extends BaseCommand {
  async handle(ctx) {
    try {
      // Your command implementation
      await ctx.reply('New command response');
    } catch (error) {
      await this.handleError(ctx, error);
    }
  }
}

module.exports = NewCommand;
```

2. Register the command in `src/bot/ChampionBot.js`:

```javascript
// Import your command
const NewCommand = require('./commands/newCommand');

// In registerDefaultCommands method:
commandRegistry.register('newcommand', NewCommand, {
  description: 'Description for menu',
  usage: '/newcommand'
});
```

The command will automatically be:
- Added to the bot's command menu
- Initialized with proper error handling
- Available through the /newcommand command

### Adding New Actions

1. Create a new action class in `src/bot/actions/`:

```javascript
const BaseAction = require('./baseAction');

class NewAction extends BaseAction {
  async handle(ctx) {
    try {
      await this.answerCallback(ctx);
      // Your action implementation
      await ctx.reply('New action response');
    } catch (error) {
      await this.handleError(ctx, error);
    }
  }
}

module.exports = NewAction;
```

2. Register the action in `src/bot/ChampionBot.js`:

```javascript
// Import your action
const NewAction = require('./actions/newAction');

// In registerDefaults method:
actionRegistry.register('newaction', NewAction, {
  description: 'Description of the action',
  type: 'button'
});
```

The action will automatically be:
- Initialized with proper error handling
- Available through the specified trigger (e.g., button callback)
- Configured with metadata for management

### Handler Registration

Commands and actions are registered in ChampionBot through dedicated methods:

```javascript
class ChampionBot {
  registerCommands() {
    // Register commands with metadata
  }

  registerActions() {
    // Register actions with metadata
  }

  registerDefaults() {
    this.registerCommands();
    this.registerActions();
  }
}
```

### Metadata Support

Both commands and actions support rich metadata:
- `description`: Shown in Telegram's command menu
- `usage`: Command usage information
- Additional custom metadata as needed

#### Command Metadata
```javascript
commandRegistry.register('trade', TradeCommand, {
  description: 'Open trading interface',  // Shown in menu
  usage: '/trade',                        // Usage help
  category: 'trading',                    // Grouping
  requiresAuth: true                      // Auth flag
});
```

#### Action Metadata
```javascript
actionRegistry.register('about', AboutAction, {
  description: 'About Champion Trade',    // Description
  type: 'button',                        // UI type
  category: 'info',                      // Grouping
  requiresAuth: false                    // Auth flag
});
```

## Testing

The project includes comprehensive tests:

```
src/
├── bot/
│   ├── commands/__tests__/     # Command tests
│   ├── actions/__tests__/      # Action tests
└── utils/__tests__/           # Utility tests
```

Run tests with:
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

## Separation from Web App

This bot is intentionally separated from the web app for several reasons:
1. Independent scaling - Bot and web app can be scaled separately
2. Easier maintenance - Changes to bot don't affect web app and vice versa
3. Better deployment flexibility - Can be deployed to different platforms
4. Clearer separation of concerns - Bot handles Telegram interactions, web app handles trading interface

## Development Workflow

1. Bot and web app can be developed independently
2. For local testing:
   - Run web app locally (e.g., `npm run dev` in web app project)
   - Update bot's `WEBAPP_URL` to point to local web app
   - Run bot locally (`npm run dev`)

3. For production:
   - Deploy web app to production host
   - Update bot's `WEBAPP_URL` to production URL
   - Deploy bot using preferred method
