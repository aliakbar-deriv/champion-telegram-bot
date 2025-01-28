const StartCommand = require('../startCommand');
const { MessageTemplates } = require('../../../constants');
const config = require('../../../config');
const Logger = require('../../../utils/logger');

// Mock dependencies
jest.mock('../../../utils/logger');
jest.mock('../../../config', () => ({
  bot: {
    webAppUrl: 'https://test-webapp.com'
  },
  urls: {
    learnMore: 'https://test-learn-more.com'
  }
}));

describe('StartCommand', () => {
  let startCommand;
  let mockCtx;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create mock context
    mockCtx = {
      replyWithPhoto: jest.fn().mockResolvedValue(true),
      from: {
        id: 123,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User'
      }
    };

    startCommand = new StartCommand();
  });

  it('should send welcome message with correct buttons', async () => {
    await startCommand.handle(mockCtx);

    // Verify photo message was sent with correct options
    expect(mockCtx.replyWithPhoto).toHaveBeenCalledWith(
      'https://i.imgur.com/XgXiwOf.jpg',
      {
        caption: MessageTemplates.WELCOME,
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Trade Now! 📈', web_app: { url: config.bot.webAppUrl } }],
            [{ text: 'About', callback_data: 'about' }, { text: 'Explore More 🌟', url: config.urls.learnMore }]
          ]
        },
        parse_mode: 'HTML'
      }
    );

    // Verify logging
    expect(Logger.debug).toHaveBeenCalledWith('New user started bot:', expect.objectContaining({
      user: expect.objectContaining({
        id: 123,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      }),
      messageTemplate: 'WELCOME',
      webAppUrl: config.bot.webAppUrl,
      learnMoreUrl: config.urls.learnMore
    }));
  });

  it('should handle errors properly', async () => {
    const error = new Error('Test error');
    mockCtx.replyWithPhoto.mockRejectedValue(error);

    // Mock handleError method from BaseCommand
    startCommand.handleError = jest.fn();

    await startCommand.handle(mockCtx);

    // Verify error was handled
    expect(startCommand.handleError).toHaveBeenCalledWith(mockCtx, error);
  });
});
