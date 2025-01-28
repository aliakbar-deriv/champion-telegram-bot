const BaseAction = require('../baseAction');
const Logger = require('../../../utils/logger');

// Mock dependencies
jest.mock('../../../utils/logger');

describe('BaseAction', () => {
  let baseAction;
  let mockBot;
  let mockCtx;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock bot
    mockBot = {
      action: jest.fn()
    };

    // Create mock context
    mockCtx = {
      reply: jest.fn().mockResolvedValue(true),
      answerCbQuery: jest.fn().mockResolvedValue(true),
      callbackQuery: {
        data: 'test_action'
      },
      from: {
        id: 123,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        language_code: 'en'
      }
    };

    baseAction = new BaseAction(mockBot);
  });

  describe('register', () => {
    it('should register action handler with bot for string trigger', () => {
      baseAction.register('test_action');

      expect(mockBot.action).toHaveBeenCalledWith('test_action', expect.any(Function));
    });

    it('should register action handler with bot for regex trigger', () => {
      const trigger = /^test_.+$/;
      baseAction.register(trigger);

      expect(mockBot.action).toHaveBeenCalledWith(trigger, expect.any(Function));
    });

    it('should bind handle method to action', async () => {
      // Create a child class that implements handle
      class TestAction extends BaseAction {
        async handle(ctx) {
          await this.answerCallback(ctx);
          await ctx.reply('Test response');
        }
      }
      
      const testAction = new TestAction(mockBot);
      const handleSpy = jest.spyOn(testAction, 'handle');
      testAction.register('test_action');

      // Get the registered handler function
      const handler = mockBot.action.mock.calls[0][1];
      
      // Call the handler
      await handler(mockCtx);

      expect(handleSpy).toHaveBeenCalledWith(mockCtx);
      expect(mockCtx.answerCbQuery).toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith('Test response');
    });
  });

  describe('handle', () => {
    it('should throw error when not implemented', async () => {
      // Create a new instance without implementing handle
      const action = new BaseAction(mockBot);
      
      await expect(action.handle(mockCtx))
        .rejects
        .toThrow('Action handler must implement handle method');
    });

    it('should allow implementation by child class', async () => {
      // Create a child class that implements handle
      class TestAction extends BaseAction {
        async handle(ctx) {
          await this.answerCallback(ctx);
          await ctx.reply('Test response');
        }
      }
      
      const testAction = new TestAction(mockBot);
      await testAction.handle(mockCtx);

      expect(mockCtx.answerCbQuery).toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith('Test response');
    });
  });

  describe('getUserInfo', () => {
    it('should extract user info from context', () => {
      const userInfo = baseAction.getUserInfo(mockCtx);

      expect(userInfo).toEqual({
        id: 123,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        languageCode: 'en'
      });
    });

    it('should handle missing optional user fields', () => {
      const partialCtx = {
        from: {
          id: 123,
          username: 'testuser'
          // first_name, last_name, and language_code are missing
        }
      };

      const userInfo = baseAction.getUserInfo(partialCtx);

      expect(userInfo).toEqual({
        id: 123,
        username: 'testuser',
        firstName: undefined,
        lastName: undefined,
        languageCode: undefined
      });
    });
  });

  describe('handleError', () => {
    it('should log error and send error message', async () => {
      const error = new Error('Test error');
      
      await baseAction.handleError(mockCtx, error);

      // Verify error was logged
      expect(Logger.error).toHaveBeenCalledWith(
        'Action error: Test error',
        expect.objectContaining({
          action: 'test_action',
          user: expect.objectContaining({
            id: 123,
            username: 'testuser'
          }),
          error: expect.objectContaining({
            message: error.message,
            stack: error.stack
          })
        })
      );

      // Verify error message was sent to user
      expect(mockCtx.reply).toHaveBeenCalledWith(
        'Sorry, there was an error processing your request. Please try again.'
      );
    });
  });

  describe('answerCallback', () => {
    it('should answer callback query successfully', async () => {
      await baseAction.answerCallback(mockCtx);

      expect(mockCtx.answerCbQuery).toHaveBeenCalled();
    });

    it('should handle error in answering callback query', async () => {
      const error = new Error('Failed to answer callback');
      mockCtx.answerCbQuery.mockRejectedValue(error);

      await baseAction.answerCallback(mockCtx);

      // Should log the error
      expect(Logger.error).toHaveBeenCalledWith(
        'Error answering callback query:',
        expect.objectContaining({
          error: error.message,
          stack: error.stack,
          user: expect.objectContaining({
            id: 123,
            username: 'testuser'
          }),
          callbackQuery: 'test_action'
        })
      );
    });

    it('should handle missing callback query data', async () => {
      delete mockCtx.callbackQuery;

      await baseAction.answerCallback(mockCtx);
      await baseAction.handleError(mockCtx, new Error('Test error'));

      // Should still work without callback query data
      expect(mockCtx.answerCbQuery).toHaveBeenCalled();
      expect(Logger.error).toHaveBeenCalled();
    });
  });
});
