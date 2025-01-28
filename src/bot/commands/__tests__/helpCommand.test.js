const HelpCommand = require('../helpCommand');
const { MessageTemplates } = require('../../../constants');
const config = require('../../../config');
const Logger = require('../../../utils/logger');

// Mock dependencies
jest.mock('../../../utils/logger');
jest.mock('../../../config', () => ({
  urls: {
    support: 'https://test-support.com'
  }
}));

describe('HelpCommand', () => {
  let helpCommand;
  let mockCtx;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create mock context
    mockCtx = {
      reply: jest.fn().mockResolvedValue(true),
      from: {
        id: 123,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User'
      }
    };

    helpCommand = new HelpCommand();
  });

  it('should send help guide with support button', async () => {
    await helpCommand.handle(mockCtx);

    // Verify help message was sent with correct options
    expect(mockCtx.reply).toHaveBeenCalledWith(
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

    // Verify logging
    expect(Logger.debug).toHaveBeenCalledWith('User requested help:', expect.objectContaining({
      user: expect.objectContaining({
        id: 123,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      }),
      messageTemplate: 'HELP_GUIDE',
      supportUrl: config.urls.support
    }));
  });

  it('should handle errors properly', async () => {
    const error = new Error('Test error');
    mockCtx.reply.mockRejectedValue(error);

    // Mock handleError method from BaseCommand
    helpCommand.handleError = jest.fn();

    await helpCommand.handle(mockCtx);

    // Verify error was handled
    expect(helpCommand.handleError).toHaveBeenCalledWith(mockCtx, error);
  });
});
