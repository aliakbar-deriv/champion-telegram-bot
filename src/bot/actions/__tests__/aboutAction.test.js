const AboutAction = require('../aboutAction');
const { MessageTemplates, BotActionTypes } = require('../../../constants');
const Logger = require('../../../utils/logger');

// Mock dependencies
jest.mock('../../../utils/logger');

const config = require('../../../config');

// Mock dependencies
jest.mock('../../../config', () => ({
  bot: {
    webAppHostUrl: 'https://test-webapp.com'
  }
}));

describe('AboutAction', () => {
  let aboutAction;
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

    aboutAction = new AboutAction();
    // Mock the answerCallback method from BaseAction
    aboutAction.answerCallback = jest.fn().mockResolvedValue(true);
  });

  it('should handle about action successfully', async () => {
    await aboutAction.handle(mockCtx);

    // Verify callback was answered
    expect(aboutAction.answerCallback).toHaveBeenCalledWith(mockCtx);

    // Verify about message was sent with correct keyboard
    expect(mockCtx.reply).toHaveBeenCalledWith(
      MessageTemplates.ABOUT,
      {
        reply_markup: {
          inline_keyboard: [[
            {
              text: 'Start trading',
              web_app: { url: config.bot.webAppHostUrl }
            }
          ]]
        }
      }
    );

    // Verify logging
    expect(Logger.debug).toHaveBeenCalledWith('User viewed about info:', expect.objectContaining({
      user: expect.objectContaining({
        id: 123,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      }),
      actionType: BotActionTypes.ABOUT,
      messageTemplate: 'ABOUT'
    }));
  });

  it('should handle errors properly', async () => {
    const error = new Error('Test error');
    mockCtx.reply.mockRejectedValue(error);

    // Mock handleError method from BaseAction
    aboutAction.handleError = jest.fn();

    await aboutAction.handle(mockCtx);

    // Verify error was handled
    expect(aboutAction.handleError).toHaveBeenCalledWith(mockCtx, error);
  });

  it('should handle callback answer failure', async () => {
    const error = new Error('Callback answer failed');
    aboutAction.answerCallback.mockRejectedValue(error);

    // Mock handleError method from BaseAction
    aboutAction.handleError = jest.fn();

    await aboutAction.handle(mockCtx);

    // Verify error was handled
    expect(aboutAction.handleError).toHaveBeenCalledWith(mockCtx, error);
  });
});
